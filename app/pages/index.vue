<template>
  <div>
    <MeshMap
      style="height: 100vh"
      :is-adding-mode="simulator.mode == MeshSimulatorMode.ADD"
      @click="handleMapClick"
    >
      <MeshNodeMarker
        v-for="node in simulator.nodes"
        :key="node.id"
        :node="node"
        @moved="
          (lat: number, lng: number) => simulator.moveNode(node, lat, lng)
        "
        @click="simulator.transmitFromNode(node)"
      />
    </MeshMap>
    <AppSidebar />
  </div>
</template>

<script setup lang="ts">
import { MeshSimulatorMode } from "~/simulator/mesh-simulator";

const { simulator } = useSimulator();
const { hopLimit, defaultRole } = useSimulatorSettings();

const handleMapClick = (lat: number, lng: number) => {
  if (simulator.mode == MeshSimulatorMode.ADD) {
    simulator.addNode(lat, lng, hopLimit.value, defaultRole.value);
  }
};
</script>
