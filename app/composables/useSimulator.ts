import { MeshLogger } from "~/simulator/mesh-logger";
import { MeshSimulator } from "~/simulator/mesh-simulator";

let simulator: MeshSimulator | null = null;
let logger: MeshLogger | null = null;

export const useSimulator = () => {
  if (!logger) {
    logger = new MeshLogger();
  }

  if (!simulator) {
    simulator = new MeshSimulator(logger);
  }

  return {
    simulator: reactive(simulator) as MeshSimulator,
    logger: reactive(logger) as MeshLogger,
  };
};
