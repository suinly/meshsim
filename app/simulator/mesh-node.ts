export class MeshNode {
  public isTransmitting: boolean = false
  public isReceiving: boolean = false
  public seenPackets: number[] = []

  constructor(
    public id: number,
    public lat: number,
    public lng: number,
    public hopLimit: number = 3
  ) {}
}
