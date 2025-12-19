import { Logger } from "~/simulator/Logger";
import { Simulator } from "~/simulator/Simulator";

let simulator: Simulator | null = null;
let logger: Logger | null = null;

export const useSimulator = () => {
  if (!logger) {
    logger = new Logger();
  }

  if (!simulator) {
    simulator = new Simulator(logger);
  }

  return {
    simulator: reactive(simulator) as Simulator,
    logger: reactive(logger) as Logger,
  };
};
