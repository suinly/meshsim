import { NodeRole } from "~/simulator/NodeRole";

export const useSimulatorSettings = () => {
  const hopLimit = useState("simulator-hop-limit", () => 3);
  const defaultRole = useState("simulator-default-role", () => NodeRole.CLIENT);
  const defaultPower = useState("simulator-default-power", () => 20);
  const defaultHeight = useState("simulator-default-height", () => 1);

  return {
    hopLimit,
    defaultRole,
    defaultPower,
    defaultHeight,
  };
};
