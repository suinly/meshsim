import { BaseNode } from "./BaseNode";
import { NodeRole } from "./NodeRole";
import type { Packet } from "./Packet";

export class ClientNode extends BaseNode {
  get role(): NodeRole {
    return NodeRole.CLIENT;
  }

  shouldRebroadcast(packet: Packet): boolean {
    return !this.heardReboardcast(packet);
  }

  shouldDecrementHopLimit(_packet: Packet): boolean {
    return true;
  }

  getRebroadcastDelay(snr: number): number {
    // Задержка на основе SNR (как в Meshtastic)
    // Узлы с худшим SNR (дальше) передают раньше
    // Узлы с лучшим SNR (ближе) передают позже
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
}
