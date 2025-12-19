import type { CadTransmitter } from "./CADTransmitter";
import type { Logger } from "./Logger";
import { NodeRole } from "./NodeRole";
import { NodeState } from "./NodeState";
import { Packet } from "./Packet";

export abstract class BaseNode {
  constructor(
    public id: number,
    public lat: number,
    public lng: number,
    public hopLimit: number = 3,
    public power: number = 20,
    private logger: Logger,
  ) {}

  state: NodeState = NodeState.LISTENING;
  transmittedPackets: Packet[] = [];
  receivedPackets: Packet[] = [];
  favorites: BaseNode[] = [];

  abstract get role(): NodeRole;
  abstract shouldRebroadcast(packet: Packet): boolean;
  abstract shouldDecrementHopLimit(packet: Packet): boolean;
  abstract getRebroadcastDelay(snr: number): number;

  async transmit(packet: Packet) {
    // Помечаем, что мы ретранслировали последними
    packet.relayId = this.id;

    // Уменьшаем hopLimit, если необходимо
    if (this.shouldDecrementHopLimit(packet)) {
      packet.hopLimit--;
    }

    // Начинаем трансляцию
    this.state = NodeState.TRANSMITING;
    await this.sleep(600);
    this.state = NodeState.LISTENING;

    this.markPacketTransmitted(packet);
    this.logger.info(`Пакет #${packet.id} успешно передан`, this);
  }

  async receive(packet: Packet) {
    if (this.state !== NodeState.LISTENING) return;

    this.state = NodeState.RECEIVING;
    await this.sleep(600);
    this.state = NodeState.LISTENING;

    this.markPacketReceived(packet);
    const alreadyHeard = this.heardReboardcast(packet);
    this.logger.info(
      `Пакет #${packet.id} получен ${alreadyHeard ? "повторно, отмена запланированной ретрансляции" : ""}`,
      this,
    );
  }

  hasInFavorites(nodeId: number) {
    return !!this.favorites.find((node) => node.id === nodeId);
  }

  markPacketTransmitted(packet: Packet): void {
    this.transmittedPackets.push(packet);
  }

  markPacketReceived(packet: Packet): void {
    this.receivedPackets.push(packet);
  }

  heardReboardcast(packet: Packet): boolean {
    return (
      this.receivedPackets.filter((item) => item.id === packet.id).length > 1
    );
  }

  canTransmit(): boolean {
    return this.state === NodeState.LISTENING;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
