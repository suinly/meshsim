import { MeshNodeRole } from "~/simulator/mesh-node";

export const useSimulatorSettings = () => {
  const hopLimit = useState("simulator-hop-limit", () => 3);
  const defaultRole = useState(
    "simulator-default-role",
    () => MeshNodeRole.CLIENT,
  );

  return {
    hopLimit,
    defaultRole,
  };
};
