import type { BaseNode } from "./BaseNode";
import { LogEntityType } from "./LogEntityType";

interface LogEntity {
  message: string;
  type: LogEntityType;
  createdAt: Date;
  node?: BaseNode;
}

export class Logger {
  public storage: LogEntity[] = [];

  log(
    message: string,
    type: LogEntityType = LogEntityType.INFO,
    node?: BaseNode,
  ) {
    this.storage.push({
      message,
      type,
      createdAt: new Date(),
      node,
    });
  }

  error(message: string, node?: BaseNode) {
    this.log(message, LogEntityType.ERROR, node);
  }

  warning(message: string, node?: BaseNode) {
    this.log(message, LogEntityType.WARNING, node);
  }

  success(message: string, node?: BaseNode) {
    this.log(message, LogEntityType.SUCCESS, node);
  }

  info(message: string, node?: BaseNode) {
    this.log(message, LogEntityType.INFO, node);
  }
}
