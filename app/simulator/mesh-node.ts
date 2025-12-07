export class MeshNode {
  public isTransmitting: boolean = false;
  public isReceiving: boolean = false;
  public hopLimit: number = 3;
  public seenPackets: number[] = [];

  constructor(
    public id: number,
    public lat: number,
    public lng: number,
  ) {}
}
