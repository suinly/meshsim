import type { MeshLogger } from "./mesh-logger";
import { MeshNode, MeshNodeRole } from "./mesh-node";
import { MeshPacket } from "./mesh-packet";

export enum MeshSimulatorMode {
  ADD,
  VIEW,
}

export class MeshSimulator {
  public nodes: MeshNode[] = [];
  public packetCount: number = 0;
  public mode: MeshSimulatorMode = MeshSimulatorMode.ADD;

  constructor(public logger: MeshLogger) {}

  public addNode(
    lat: number,
    lng: number,
    hopLimit: number = 3,
    role: MeshNodeRole = MeshNodeRole.CLIENT,
  ) {
    const id = this.nodes.length + 1;
    const node = new MeshNode(id, lat, lng, hopLimit, role);

    this.nodes.push(node);

    this.logger.success("Добавлена нода", node);
  }

  public moveNode(node: MeshNode, lat: number, lng: number) {
    const index = this.findNodeIndexById(node.id);

    if (!this.nodes[index]) return;

    this.nodes[index].lat = lat;
    this.nodes[index].lng = lng;
  }

  public transmitFromNode(node: MeshNode, packet?: MeshPacket, retryCount = 0) {
    // Если не найдена нода, то и делать нечего
    const index = this.findNodeIndexById(node.id);
    if (!this.nodes[index]) return;

    // Если уже транслирует, не далем ничего
    if (this.nodes[index].isTransmitting) return;

    // Создаем новый пакет, если не указан
    if (!packet) {
      packet = new MeshPacket(++this.packetCount, node.id, node.hopLimit);
    }

    if (!packet.canRebroadcast()) {
      return;
    }

    // Carrier Sense - проверяем, не передают ли ближайшие ноды
    if (this.isChannelBusy(node)) {
      // Канал занят, откладываем передачу
      if (retryCount < 5) {
        // Экспоненциальная задержка с jitter
        const backoffDelay = Math.random() * Math.pow(2, retryCount) * 100;
        console.log(
          `Канал занят для узла ${node.id}, повтор через ${backoffDelay.toFixed(0)}мс (попытка ${retryCount + 1})`,
        );
        setTimeout(() => {
          this.transmitFromNode(node, packet, retryCount + 1);
        }, backoffDelay);
        return;
      } else {
        console.log(
          `Канал занят для узла ${node.id}, достигнуто максимальное количество попыток, пакет отброшен`,
        );
        return;
      }
    }

    // Включаем передачу пакета
    this.nodes[index].isTransmitting = true;

    console.log("Передача: ", node.id);

    // Выключаем через 1 секунду
    setTimeout(() => {
      if (!this.nodes[index]) return;
      this.nodes[index].isTransmitting = false;
    }, 1000);

    // Рассчитываем, кто получит сообщение
    this.propagateMessage(node, packet);
  }

  private propagateMessage(sourceNode: MeshNode, packet: MeshPacket) {
    const maxRange = 5000; // 5км
    const newPacket = packet.clone();

    this.nodes.forEach((targetNode) => {
      if (targetNode.id == packet.fromId) return;

      const distance = this.calculateDistanceBetweenNodes(
        sourceNode,
        targetNode,
      );

      if (distance <= maxRange) {
        const snr = this.calculateSNR(distance, maxRange);

        // Вероятность успешного приема зависит от SNR
        const receptionProbability = this.getReceptionProbability(snr);

        // Симуляция потери пакетов
        if (Math.random() > receptionProbability) {
          console.log(
            `Пакет потерян: узел ${sourceNode.id} -> ${targetNode.id}, SNR: ${snr.toFixed(1)} dB, вероятность: ${(receptionProbability * 100).toFixed(0)}%`,
          );
          return; // Пакет потерян из-за плохого SNR
        }

        // Ставим статус получения
        if (!targetNode.isTransmitting) {
          targetNode.isReceiving = true;

          setTimeout(() => {
            targetNode.isReceiving = false;
          }, 600);
        }

        // если роль CLIENT_MUTE, то не ретранслируем
        if (targetNode.role === MeshNodeRole.CLIENT_MUTE) return;

        // Проверяем, видели ли уже этот пакет
        const alreadySeen = targetNode.seenPackets.includes(packet.id);

        // Всегда добавляем в seenPackets (даже если видели повторно)
        targetNode.seenPackets.push(packet.id);

        // Если роль ROUTER, ретранслируем сразу, если не уже
        if (
          targetNode.role === MeshNodeRole.ROUTER &&
          !targetNode.isTransmitting
        ) {
          this.transmitFromNode(targetNode, newPacket);
          return;
        }

        // Если уже видели - не планируем новую ретрансляцию
        if (alreadySeen) {
          console.log(
            `Дубликат пакета: узел ${targetNode.id} получил пакет ${packet.id} повторно`,
          );
          return;
        }

        // Узел в зоне досягаемости - переотправить через задержку
        // Задержка зависит от SNR (как в Meshtastic)
        // Узлы с худшим SNR передают раньше, с лучшим - позже
        const retransmissionDelay = this.calculateRetransmissionDelay(snr);

        setTimeout(() => {
          // Проверяем, не получили ли мы этот пакет повторно во время ожидания
          const seenCount = targetNode.seenPackets.filter(
            (id) => id === newPacket.id,
          ).length;

          if (seenCount > 1) {
            console.log(
              `Подавление ретрансляции: узел ${targetNode.id} получил пакет ${newPacket.id} ${seenCount} раз`,
            );
            return;
          }

          if (!targetNode.isTransmitting) {
            console.log(
              `Ретрансляция: узел ${targetNode.id}, хоп ${newPacket.hopCount}, SNR: ${snr.toFixed(1)} dB, задержка: ${retransmissionDelay.toFixed(0)}мс`,
            );
            this.transmitFromNode(targetNode, newPacket);
          }
        }, retransmissionDelay);
      }
    });
  }

  private calculateDistanceBetweenNodes(
    firstNode: MeshNode,
    secondNode: MeshNode,
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

  private calculateRetransmissionDelay(snr: number) {
    // Задержка на основе SNR (как в Meshtastic)
    // Узлы с худшим SNR (дальше) передают раньше
    // Узлы с лучшим SNR (ближе) передают позже
    // SNR = -15 dB (плохой, далеко): ~0ms задержки
    // SNR = 15 dB (отличный, близко): ~2000ms задержки

    const minSNR = -15;
    const maxSNR = 15;
    const maxDelay = 2000; // ms

    // Нормализуем SNR в диапазон [0, 1]
    const normalizedSNR = Math.max(
      0,
      Math.min(1, (snr - minSNR) / (maxSNR - minSNR)),
    );

    // Прямая зависимость: худший SNR = меньшая задержка
    const snrBasedDelay = maxDelay * normalizedSNR;

    // Добавляем небольшую случайную составляющую для избежания коллизий
    const randomJitter = Math.random() * 100; // 0-100ms

    return snrBasedDelay + randomJitter;
  }

  private isChannelBusy(node: MeshNode): boolean {
    // Проверяем, не передают ли ближайшие ноды (в радиусе слышимости)
    const maxRange = 5000; // 5км - такой же как радиус передачи

    for (const otherNode of this.nodes) {
      // Пропускаем саму ноду
      if (otherNode.id === node.id) continue;

      // Если другая нода передает
      if (otherNode.isTransmitting) {
        // Проверяем расстояние
        const distance = this.calculateDistanceBetweenNodes(node, otherNode);

        // Если в радиусе слышимости - канал занят
        if (distance <= maxRange) {
          return true;
        }
      }
    }

    return false;
  }

  private findNodeIndexById(id: number): number {
    for (const k in this.nodes) {
      if (this.nodes[k]?.id === id) {
        return parseInt(k);
      }
    }

    throw Error("Индекс узла не найден");
  }
}
