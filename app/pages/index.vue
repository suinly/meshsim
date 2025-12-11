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
    <AppSidebar
      class="fixed z-999 h-screen overflow-y-auto p-4 w-[320px] top-0 right-0"
    />
    <AppFooter class="fixed z-999 h-[300px] p-4 w-full bottom-0" />
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
