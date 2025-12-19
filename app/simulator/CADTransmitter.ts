import type { BaseNode } from "./BaseNode";
import { NodeState } from "./NodeState";

export interface CadConfig {
  slotTimeMsec: number; // Время одного слота (зависит от SF)
  cwMin: number; // Минимальный размер окна конкуренции
  cwMax: number; // Максимальный размер окна конкуренции
  maxRetries: number; // Максимальное количество попыток
  cadDurationMsec: number; // Длительность одной CAD операции
  maxRange: number; // Максимальная дистанция, на которой слышно другую ноду (метры)
}

export interface NodeContext {
  currentNode: BaseNode; // Нода, которая пытается передать
  allNodes: BaseNode[]; // Все ноды в симуляторе
}

enum CadResult {
  CHANNEL_FREE = "CHANNEL_FREE",
  LORA_DETECTED = "LORA_DETECTED",
  ERROR = "ERROR",
}

export class CadTransmitter {
  private config: CadConfig;

  constructor(config: CadConfig) {
    this.config = config;
  }

  // Проверка, занят ли канал (на основе реальных нод в симуляторе)
  private isChannelBusy(context: NodeContext): boolean {
    for (const otherNode of context.allNodes) {
      // Не проверяем саму ноду
      if (otherNode.id === context.currentNode.id) continue;

      // Проверяем, передает ли другая нода
      if (otherNode.state === NodeState.TRANSMITING) {
        const distance = this.calculateDistanceBetweenNodes(
          context.currentNode,
          otherNode,
        );

        // Канал занят, если передает нода в зоне максимальной дистанции
        if (distance <= this.config.maxRange) {
          return true;
        }
      }
    }

    return false;
  }

  // Симуляция CAD операции (в реальности вызов к радио)
  private async performCAD(context: NodeContext): Promise<CadResult> {
    // Симуляция времени CAD операции
    await this.sleep(this.config.cadDurationMsec);

    // Проверяем, занят ли канал на основе реальных нод
    if (this.isChannelBusy(context)) {
      return CadResult.LORA_DETECTED;
    }

    return CadResult.CHANNEL_FREE;
  }

  // Рассчет размера окна конкуренции (используем среднее значение)
  private calculateCWSize(): number {
    // Используем среднее между cwMin и cwMax
    return Math.round((this.config.cwMin + this.config.cwMax) / 2);
  }

  //  Рассчет случайной задержки из окна конкуренции
  private calculateBackoffDelay(): number {
    const cwSize = this.calculateCWSize();
    const maxSlots = Math.pow(2, cwSize);
    const randomSlots = Math.floor(Math.random() * maxSlots);

    return randomSlots * this.config.slotTimeMsec;
  }

  // Рассчет расстояния между нодами (формула Haversine)
  private calculateDistanceBetweenNodes(
    firstNode: BaseNode,
    secondNode: BaseNode,
  ): number {
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

  // Вспомогательная функция для задержки
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Основная функция: попытка передачи с CAD и повторными попытками
  async attemptTransmission(context: NodeContext): Promise<{
    success: boolean;
    attempts: number;
    totalDelayMsec: number;
  }> {
    let attempts = 0;
    let totalDelay = 0;

    while (attempts < this.config.maxRetries) {
      attempts++;

      // Выполнить CAD
      const cadResult = await this.performCAD(context);

      if (cadResult === CadResult.CHANNEL_FREE) {
        return {
          success: true,
          attempts,
          totalDelayMsec: totalDelay,
        };
      }

      if (cadResult === CadResult.LORA_DETECTED) {
        // Если это не последняя попытка, рассчитать задержку
        if (attempts < this.config.maxRetries) {
          const backoffDelay = this.calculateBackoffDelay();
          await this.sleep(backoffDelay);
          totalDelay += backoffDelay;
        }
      } else {
        return {
          success: false,
          attempts,
          totalDelayMsec: totalDelay,
        };
      }
    }

    return {
      success: false,
      attempts,
      totalDelayMsec: totalDelay,
    };
  }
}
