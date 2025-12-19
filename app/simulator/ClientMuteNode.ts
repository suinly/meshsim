import { BaseNode } from "./BaseNode";
import { NodeRole } from "./NodeRole";
import type { Packet } from "./Packet";

export class ClientMuteNode extends BaseNode {
  get role(): NodeRole {
    return NodeRole.CLIENT_MUTE;
  }

  shouldRebroadcast(_packet: Packet): boolean {
    return false;
  }

  shouldDecrementHopLimit(_packet: Packet): boolean {
    return false;
  }

  getRebroadcastDelay(_snr: number): number {
    return 0;
  }
}
