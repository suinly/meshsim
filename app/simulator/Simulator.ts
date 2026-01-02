import type { BaseNode } from "./BaseNode";
import type { Logger } from "./Logger";
import { SimulatorMode } from "./SimulatorMode";
import { ClientMuteNode } from "./ClientMuteNode";
import { ClientNode } from "./ClientNode";
import { NodeRole } from "./NodeRole";
import { RouterNode } from "./RouterNode";
import { Packet } from "./Packet";
import { CadTransmitter, type NodeContext } from "./CADTransmitter";

export class Simulator {
  nodes: BaseNode[] = [];
  selectedNodes: Set<number> = new Set();
  mode: SimulatorMode = SimulatorMode.ADD;
  packetCount: number = 0;
  private cadTransmitter: CadTransmitter;

  constructor(public logger: Logger) {
    // Инициализируем CADTransmitter с конфигурацией по умолчанию
    this.cadTransmitter = new CadTransmitter({
      slotTimeMsec: 10, // Время одного слота
      cwMin: 3, // Минимальный размер окна конкуренции
      cwMax: 7, // Максимальный размер окна конкуренции
      maxRetries: 5, // Максимальное количество попыток
      cadDurationMsec: 5, // Длительность CAD операции
      maxRange: 5000, // Максимальная дистанция (5км)
    });
  }

  addNode(
    lat: number,
    lng: number,
    hopLimit: number = 3,
    power: number = 20,
    role: NodeRole = NodeRole.CLIENT,
    height: number = 0,
  ) {
    const id = this.nodes.length + 1;
    let node: BaseNode;

    switch (role) {
      case NodeRole.CLIENT:
        node = new ClientNode(
          id,
          lat,
          lng,
          hopLimit,
          power,
          height,
          this.logger,
        );
        break;
      case NodeRole.CLIENT_MUTE:
        node = new ClientMuteNode(
          id,
          lat,
          lng,
          hopLimit,
          power,
          height,
          this.logger,
        );
        break;
      case NodeRole.ROUTER:
        node = new RouterNode(
          id,
          lat,
          lng,
          hopLimit,
          power,
          height,
          this.logger,
        );
        break;
      default:
        throw new Error("Роль не реализована");
    }

    this.nodes.push(node);
  }

  moveNode(node: BaseNode, lat: number, lng: number) {
    node.lat = lat;
    node.lng = lng;
  }

  nodeById(id: number) {
    return this.nodes.find((item) => item.id === id);
  }

  removeNode(node: BaseNode) {
    const index = this.nodes.findIndex((n) => n.id === node.id);
    if (index !== -1) {
      this.nodes.splice(index, 1);
    }
    this.selectedNodes.delete(node.id);
  }

  changeNodeRole(
    node: BaseNode,
    newRole: NodeRole,
    hopLimit: number,
    power: number,
    height: number,
  ) {
    // Запоминаем индекс и данные узла
    const index = this.nodes.findIndex((n) => n.id === node.id);
    if (index === -1) return;

    const { id, lat, lng } = node;

    // Создаем новый узел с нужной ролью
    let newNode: BaseNode;

    switch (newRole) {
      case NodeRole.CLIENT:
        newNode = new ClientNode(
          id,
          lat,
          lng,
          hopLimit,
          power,
          height,
          this.logger,
        );
        break;
      case NodeRole.CLIENT_MUTE:
        newNode = new ClientMuteNode(
          id,
          lat,
          lng,
          hopLimit,
          power,
          height,
          this.logger,
        );
        break;
      case NodeRole.ROUTER:
        newNode = new RouterNode(
          id,
          lat,
          lng,
          hopLimit,
          power,
          height,
          this.logger,
        );
        break;
      default:
        throw new Error("Роль не реализована");
    }

    // Заменяем старый узел на новый с тем же индексом
    this.nodes.splice(index, 1, newNode);

    this.logger.info(`Роль узла изменена на ${newRole}`, newNode);
  }

  async transmitFromNode(node: BaseNode, packet?: Packet) {
    if (!packet) {
      packet = new Packet(
        ++this.packetCount,
        node.id,
        0, // всем
        node.hopLimit,
        node.id,
      );
    }

    this.logger.info(`Попытка передачи пакета #${packet.id}`, node);

    // Убеждаемся, что пакет может быть ретранслирован
    if (!packet.canBeRebroadcast()) {
      this.logger.info(
        `Пакет не может быть ретранслирован (hopLimit: ${packet.hopLimit})`,
        node,
      );
      return;
    }

    // Channel Activity Detection (CAD) с повторными попытками
    const context: NodeContext = {
      currentNode: node,
      allNodes: this.nodes,
    };

    const result = await this.cadTransmitter.attemptTransmission(context);

    if (!result.success) {
      // Не удалось передать пакет после всех попыток
      this.logger.warning(
        `Передача не удалась после попыток: ${result.attempts}`,
        node,
      );
      return;
    }

    if (packet.hopLimit !== packet.hopStart && !node.shouldRebroadcast(packet))
      return;

    // Канал свободен, передаем пакет
    this.logger.info(
      `Канал свободен, проверок: ${result.attempts} (задержка: ${result.totalDelayMsec}мс)`,
      node,
    );

    try {
      if (packet.relayId === node.id) {
        node.transmit(packet);
      } else {
        node.retransmit(packet);
      }

      // Рассчитываем, кто получит сообщение
      this.propagateMessage(node, packet);
    } catch (e) {
      this.logger.error((e as Error).message);
    }
  }

  private propagateMessage(node: BaseNode, packet: Packet) {
    const newPacket = packet.clone();

    this.nodes.forEach(async (targetNode) => {
      // Если нода слышит свой пакет, то ничего не делаем
      if (packet.relayId === targetNode.id) return;

      // Вычисляем максимальную дальность с учетом мощности и высоты передатчика
      const maxRange = this.calculateMaxRange(node.power, node.height);

      // Если нода слишком далеко, то она не слышит
      const distance = this.calculateDistanceBetweenNodes(node, targetNode);
      if (distance > maxRange) return;

      // Вероятность успешного приема также зависит и от SNR
      const snr = this.calculateSNR(
        distance,
        maxRange,
        node.power,
        node,
        targetNode,
      );
      const receptionProbability = this.getReceptionProbability(snr);

      // Пакет потерян из-за плохого SNR
      if (Math.random() > receptionProbability) {
        this.logger.info("Пакет потерян, слишком низкий SNR", targetNode);
        return;
      }

      // Нода все таки получает пакет
      await targetNode.receive(packet, snr);

      if (packet.sourceId === targetNode.id) return;

      if (!targetNode.shouldRebroadcast(packet)) return;

      // Передаем через задержку, зависимую от SNR (если таковая предусмотрена)
      const rebroadcastDelay = targetNode.getRebroadcastDelay(snr);
      this.logger.info(
        `Передача пакета #${packet.id} запланирована через ${rebroadcastDelay}ms`,
        targetNode,
      );

      setTimeout(() => {
        if (!targetNode.shouldRebroadcast(packet)) return;
        this.transmitFromNode(targetNode, newPacket);
      }, rebroadcastDelay);
    });
  }

  private calculateDistanceBetweenNodes(
    firstNode: BaseNode,
    secondNode: BaseNode,
  ) {
    const earthRadiusMeters = 6371000; // Радиус Земли в метрах
    const lat1Radians = (firstNode.lat * Math.PI) / 180;
    const lat2Radians = (secondNode.lat * Math.PI) / 180;
    const latDifferenceRadians =
      ((secondNode.lat - firstNode.lat) * Math.PI) / 180;
    const lngDifferenceRadians =
      ((secondNode.lng - firstNode.lng) * Math.PI) / 180;

    const haversineA =
      Math.sin(latDifferenceRadians / 2) * Math.sin(latDifferenceRadians / 2) +
      Math.cos(lat1Radians) *
        Math.cos(lat2Radians) *
        Math.sin(lngDifferenceRadians / 2) *
        Math.sin(lngDifferenceRadians / 2);
    const centralAngle =
      2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));

    return earthRadiusMeters * centralAngle;
  }

  private calculateMaxRange(power: number, height: number): number {
    // Базовые параметры: 20 дБм, высота 0м = 600м дальности (городская среда, уровень земли)
    const basePower = 20; // дБм
    const baseRange = 600; // метров на высоте 0м

    // Влияние мощности (формула Friis): каждые 6 дБ удваивают/уменьшают дальность вдвое
    // Range = BaseRange * 10^((Power - BasePower) / 20)
    const powerDifference = power - basePower;
    const powerFactor = Math.pow(10, powerDifference / 20);
    const powerAdjustedRange = baseRange * powerFactor;

    // Влияние высоты: линейная модель от 600м до 50км
    // На высоте 0м: 600м
    // На высоте 200м: 50км
    // Линейная интерполяция: +247м за каждый метр высоты
    const maxRangeAtMaxHeight = 50000; // 50км на высоте 200м
    const maxHeight = 200;
    const heightBonus =
      (height / maxHeight) * (maxRangeAtMaxHeight - baseRange);

    return powerAdjustedRange + heightBonus;
  }

  private calculateSNR(
    distance: number,
    maxRange: number,
    power: number,
    senderNode: BaseNode,
    receiverNode: BaseNode,
  ) {
    // SNR уменьшается с расстоянием (логарифмическая модель path loss)
    // Базовые параметры для мощности 20 дБм
    const basePower = 20; // дБм
    const baseMaxSNR = 15; // dB при базовой мощности
    const minSNR = -10; // dB

    // Корректируем максимальный SNR с учетом мощности
    // Каждый дБм мощности добавляет 1 дБ к SNR
    const powerBonus = power - basePower;
    const maxSNR = baseMaxSNR + powerBonus;

    // Базовый path loss exponent для городской среды
    const basePathLossExponent = 2.5;

    // Рассчитываем среднюю высоту между двумя узлами
    const averageHeight = (senderNode.height + receiverNode.height) / 2;

    // Коэффициент снижения влияния застройки на основе высоты
    // При 0м: коэффициент = 0 (полное влияние застройки, path loss = 2.5)
    // При 100м: коэффициент = 0.5 (path loss = 2.25)
    // При 200м: коэффициент = 1.0 (минимальное влияние застройки, path loss = 2.0)
    const heightFactor = Math.min(1.0, averageHeight / 200);

    // Эффективный path loss exponent: от 2.5 (земля) до 2.0 (высота)
    const pathLossExponent = basePathLossExponent - heightFactor * 0.5;

    // Reference distance (1 метр)
    const d0 = 1;

    // Избегаем log10(0) для очень малых расстояний
    const effectiveDistance = Math.max(distance, d0);

    // Логарифмическая модель: PL(d) = 10 * n * log10(d/d0)
    // SNR = maxSNR - PL(d)
    const pathLoss = 10 * pathLossExponent * Math.log10(effectiveDistance / d0);

    // Нормализуем pathLoss к диапазону [minSNR, maxSNR]
    // При d=d0 (1м): pathLoss=0, SNR=maxSNR
    // При d=maxRange: pathLoss рассчитывается, масштабируем к minSNR
    const maxPathLoss = 10 * pathLossExponent * Math.log10(maxRange / d0);
    const normalizedPathLoss = (pathLoss / maxPathLoss) * (maxSNR - minSNR);

    const signalStrength = maxSNR - normalizedPathLoss;

    // Случайный фединг (±2 dB log-normal shadowing)
    const fading = (Math.random() - 0.5) * 4;

    return signalStrength + fading;
  }

  private getReceptionProbability(snr: number) {
    // Сигмоидная функция для моделирования вероятности приема
    // SNR > -7 dB: хороший сигнал, высокая вероятность (~98%+)
    // SNR ~ -11 dB: 50% вероятность
    // SNR < -15 dB: плохой сигнал, почти 0% вероятность (~2%)

    const k = 1.0; // Крутизна кривой
    const threshold = -11; // Порог SNR для 50% вероятности

    return 1 / (1 + Math.exp(-k * (snr - threshold)));
  }
}
