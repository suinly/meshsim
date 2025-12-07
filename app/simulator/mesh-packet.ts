export class MeshPacket {
  public hopCount: number = 0;

  constructor(
    public id: number,
    public fromId: number,
    public hopLimit: number,
    public toId?: number,
  ) {}

  clone() {
    const packet = new MeshPacket(
      this.id,
      this.fromId,
      this.hopLimit,
      this.toId,
    );
    packet.hopCount = this.hopCount + 1;
    return packet;
  }

  canRebroadcast() {
    return this.hopCount <= this.hopLimit;
  }
}
