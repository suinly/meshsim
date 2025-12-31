import { NodeRole } from "~/simulator/NodeRole";

export const useSimulatorSettings = () => {
  const hopLimit = useState("simulator-hop-limit", () => 3);
  const defaultRole = useState("simulator-default-role", () => NodeRole.CLIENT);
  const defaultHeight = useState("simulator-default-height", () => 0);

  return {
    hopLimit,
    defaultRole,
    defaultHeight,
  };
};
