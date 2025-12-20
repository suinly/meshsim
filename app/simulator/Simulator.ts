import type { BaseNode } from "./BaseNode";
import type { Logger } from "./Logger";
import { SimulatorMode } from "./SimulatorMode";
import { ClientMuteNode } from "./ClientMuteNode";
import { ClientNode } from "./ClientNode";
import { NodeRole } from "./NodeRole";
import { RouterNode } from "./RouterNode";
import { Packet } from "./Packet";
import { NodeState } from "./NodeState";
import { CadTransmitter, type NodeContext } from "./CADTransmitter";
import { ta } from "zod/v4/locales";

export class Simulator {
  nodes: BaseNode[] = [];
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
  ) {
    const id = this.nodes.length + 1;
    let node: BaseNode;

    switch (role) {
      case NodeRole.CLIENT:
        node = new ClientNode(id, lat, lng, hopLimit, power, this.logger);
        break;
      case NodeRole.CLIENT_MUTE:
        node = new ClientMuteNode(id, lat, lng, hopLimit, power, this.logger);
        break;
      case NodeRole.ROUTER:
        node = new RouterNode(id, lat, lng, hopLimit, power, this.logger);
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
    const maxRange = 5000;
    const newPacket = packet.clone();

    this.nodes.forEach(async (targetNode) => {
      // Если нода слышит свой пакет, то ничего не делаем
      if (packet.relayId === targetNode.id) return;

      // Если нода слишком далеко, то она не слышит
      const distance = this.calculateDistanceBetweenNodes(node, targetNode);
      if (distance > maxRange) return;

      // Вероятность успешного приема также зависит и от SNR
      const snr = this.calculateSNR(distance, maxRange);
      const receptionProbability = this.getReceptionProbability(snr);

      // Пакет потерян из-за плохого SNR
      if (Math.random() > receptionProbability) {
        this.logger.info("Пакет потерян", targetNode);
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

  private calculateSNR(distance: number, maxRange: number) {
    // SNR уменьшается с расстоянием (упрощенная модель path loss)
    // На близком расстоянии: высокий SNR (~15 dB)
    // На максимальном расстоянии: низкий SNR (~-5 dB)
    const normalizedDistance = distance / maxRange;
    const maxSNR = 15; // dB
    const minSNR = -15; // dB

    // Логарифмическое затухание + случайный фединг
    const pathLoss =
      maxSNR - (maxSNR - minSNR) * Math.pow(normalizedDistance, 2);
    const fading = (Math.random() - 0.5) * 4; // ±2 dB случайного фединга

    return pathLoss + fading;
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
