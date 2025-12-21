<template>
  <div>
    <MeshMap
      style="height: 100vh"
      :is-adding-mode="simulator.mode == SimulatorMode.ADD"
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
    <UButton
      class="fixed z-999 bottom-4 left-4"
      color="neutral"
      @click="show = true"
      v-if="!show"
      icon="i-lucide-panel-bottom-open"
      >Показать панель логов</UButton
    >
    <UButton
      v-else
      @click="show = false"
      class="fixed z-999 bottom-[300px] left-4"
      icon="i-lucide-panel-bottom-close"
      color="neutral"
      >Скрыть панель логов</UButton
    >
    <AppFooter class="fixed z-999 h-[300px] p-4 w-full bottom-0" v-if="show" />
  </div>
</template>

<script setup lang="ts">
import { SimulatorMode } from "~/simulator/SimulatorMode";

const { simulator, logger } = useSimulator();
const { hopLimit, defaultRole } = useSimulatorSettings();

const show = ref(false);

onMounted(() => {
  logger.warning(
    "ВНИМАНИЕ! На данный момент симулятор в стадии активной разработки и алгоритм его работы далек от Meshtastic или любого другого протокола. Все совпадения случайны!",
  );
});

const handleMapClick = (lat: number, lng: number) => {
  if (simulator.mode == SimulatorMode.ADD) {
    simulator.addNode(lat, lng, hopLimit.value, 20, defaultRole.value);
  }
};
</script>
