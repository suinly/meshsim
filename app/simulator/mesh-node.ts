export enum MeshNodeRole {
  CLIENT,
  CLIENT_MUTE,
  ROUTER,
}

export class MeshNode {
  public isTransmitting: boolean = false;
  public isReceiving: boolean = false;
  public seenPackets: number[] = [];
  public isSelected: boolean = false;

  constructor(
    public id: number,
    public lat: number,
    public lng: number,
    public hopLimit: number = 3,
    public role: MeshNodeRole = MeshNodeRole.CLIENT,
  ) {}
}
