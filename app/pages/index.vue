<template>
  <div>
    <MeshMap
      style="height: 100vh"
      :is-adding-mode="isAddingMode"
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
      class="fixed z-999 top-4 right-4"
      :is-adding-mode="isAddingMode"
      @toggle-adding-mode="toggleAddingMode"
    />
  </div>
</template>

<script setup lang="ts">
const simulator = useSimulator();
const { hopLimit } = useSimulatorSettings();

const isAddingMode = ref(true);

const toggleAddingMode = () => {
  isAddingMode.value = !isAddingMode.value;
};

const handleMapClick = (lat: number, lng: number) => {
  if (isAddingMode.value) {
    simulator.addNode(lat, lng, hopLimit.value);
  }
};
</script>
