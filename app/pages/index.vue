<template>
  <MeshMap
    style="height: 100vh"
    :is-adding-mode="isAddingMode"
    @click="handleMapClick"
  >
    <MeshNode
      v-for="node in simulator.nodes"
      :key="node.id"
      :node="node"
      @moved="(lat: number, lng: number) => simulator.moveNode(node, lat, lng)"
      @click="simulator.transmitFromNode(node)"
    />
  </MeshMap>
  <AppSidebar
    class="fixed z-999 top-4 right-4"
    :is-adding-mode="isAddingMode"
    @toggle-adding-mode="toggleAddingMode"
  />
</template>

<script setup lang="ts">
import { MeshSimulator } from "~/simulator/mesh-simulator";

const simulator = reactive(new MeshSimulator());
const isAddingMode = ref(false);

function toggleAddingMode() {
  isAddingMode.value = !isAddingMode.value;
}

function handleMapClick(lat: number, lng: number) {
  if (isAddingMode.value) {
    simulator.addNode(lat, lng);
  }
}
</script>
