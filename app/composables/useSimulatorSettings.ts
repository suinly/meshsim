import { NodeRole } from "~/simulator/NodeRole";

export const useSimulatorSettings = () => {
  const hopLimit = useState("simulator-hop-limit", () => 3);
  const defaultRole = useState("simulator-default-role", () => NodeRole.CLIENT);

  return {
    hopLimit,
    defaultRole,
  };
};
