<template>
  <div>
    <MeshMap
      style="height: 100vh"
      :is-adding-mode="simulator.mode == SimulatorMode.ADD"
      @click="onMapClick"
    >
      <MeshNodeMarker
        v-for="node in simulator.nodes"
        :key="node.id"
        :node="node"
        :is-selected="simulator.selectedNodes.has(node.id)"
        @moved="(lat: number, lng: number) => onNodeMoved(node, lat, lng)"
        @click="(event: MouseEvent) => onNodeClick(node, event)"
      />
    </MeshMap>
    <AppSidebar
      class="fixed z-999 overflow-y-auto p-4 w-[320px] top-0 right-0"
    />
    <UButton
      v-if="!show"
      class="fixed z-999 bottom-4 left-4"
      color="neutral"
      variant="soft"
      icon="i-lucide-panel-bottom-open"
      @click="show = true"
    >
      Показать панель логов
    </UButton>
    <UButton
      v-else
      class="fixed z-999 bottom-[300px] left-4"
      icon="i-lucide-panel-bottom-close"
      color="neutral"
      variant="soft"
      @click="show = false"
    >
      Скрыть панель логов
    </UButton>
    <AppFooter v-if="show" class="fixed z-999 h-[300px] p-4 w-full bottom-0" />
  </div>
</template>

<script setup lang="ts">
import type { BaseNode } from "~/simulator/BaseNode";
import { SimulatorMode } from "~/simulator/SimulatorMode";

const { simulator } = useSimulator();
const { hopLimit, defaultRole } = useSimulatorSettings();

const show = ref(false);

const onMapClick = (lat: number, lng: number) => {
  if (simulator.mode == SimulatorMode.ADD) {
    simulator.addNode(lat, lng, hopLimit.value, 20, defaultRole.value, 0);
  } else {
    // Клик по карте (не по ноде) сбрасывает выделение
    simulator.selectedNodes.clear();
  }
};

const onNodeClick = (node: BaseNode, event?: MouseEvent) => {
  // Проверяем, зажата ли клавиша Ctrl (Windows/Linux) или Cmd (macOS)
  if (event && (event.ctrlKey || event.metaKey)) {
    // Множественный выбор
    if (simulator.selectedNodes.has(node.id)) {
      simulator.selectedNodes.delete(node.id);
    } else {
      simulator.selectedNodes.add(node.id);
    }
  } else {
    // Обычный клик - передача пакета
    simulator.transmitFromNode(node);
  }
};

const onNodeMoved = (node: BaseNode, lat: number, lng: number) => {
  simulator.moveNode(node, lat, lng);
};
</script>
