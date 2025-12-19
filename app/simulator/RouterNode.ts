import { BaseNode } from "./BaseNode";
import { NodeRole } from "./NodeRole";
import type { Packet } from "./Packet";

export class RouterNode extends BaseNode {
  get role(): NodeRole {
    return NodeRole.ROUTER;
  }

  shouldRebroadcast(packet: Packet): boolean {
    return !this.hasTransmittedPacket(packet);
  }

  shouldDecrementHopLimit(packet: Packet): boolean {
    // Первый хоп всегда должен фиксироваться
    if (packet.isFirstHop) return true;

    // ROUTER не меняет hopLimit, если пакет прислал узел в избранном
    if (this.hasInFavorites(packet.relayId)) {
      return false;
    }

    return true;
  }

  getRebroadcastDelay(_snr: number): number {
    return 0;
  }
}
