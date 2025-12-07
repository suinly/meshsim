import { MeshSimulator } from "~/simulator/mesh-simulator";

let simulator: MeshSimulator | null = null;

export const useSimulator = (): MeshSimulator => {
  if (!simulator) {
    simulator = new MeshSimulator();
  }

  return reactive(simulator) as MeshSimulator;
};
