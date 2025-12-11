import type { MeshNode } from "./mesh-node";

type MeshLogType = "warning" | "error" | "success" | "neutral";

interface MeshLogEntity {
  message: string;
  type: MeshLogType;
  createdAt: Date;
  node?: MeshNode;
}

export class MeshLogger {
  public storage: MeshLogEntity[] = [];

  log(message: string, type: MeshLogType = "neutral", node?: MeshNode) {
    this.storage.push({
      message,
      type,
      createdAt: new Date(),
      node,
    });
  }

  warning(message: string, node?: MeshNode) {
    this.log(message, "warning", node);
  }

  error(message: string, node?: MeshNode) {
    this.log(message, "error", node);
  }

  success(message: string, node?: MeshNode) {
    this.log(message, "success", node);
  }
}
