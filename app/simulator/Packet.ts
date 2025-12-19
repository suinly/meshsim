import type { BaseNode } from "./BaseNode";

export class Packet {
  hopLimit: number;

  constructor(
    public id: number,
    public sourceId: number,
    public destinationId: number,
    public hopStart: number,
    public relayId: number,
  ) {
    this.hopLimit = this.hopStart;
  }

  get isFirstHop() {
    return this.hopStart != 0 && this.hopStart == this.hopLimit;
  }

  clone() {
    return new Packet(
      this.id,
      this.sourceId,
      this.destinationId,
      this.hopStart,
      this.relayId,
    );
  }

  canBeRebroadcast() {
    return this.hopLimit > 0;
  }
}
