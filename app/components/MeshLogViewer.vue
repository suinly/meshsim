<template>
  <div ref="logContainer" class="flex flex-col gap-1 overflow-y-auto">
    <div v-for="log in logger.storage" class="font-mono text-xs">
      <span
        :class="{
          'text-red-400': log.type === 'error',
          'text-orange-400': log.type === 'warning',
          'text-green-400': log.type === 'success',
        }"
      >
        [{{ formatDate(log.createdAt) }}]
      </span>
      <span :class="getColorByNode(log.node)" v-if="log.node">
        [{{ log.node.id }}]
      </span>
      <span>
        {{ log.message }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MeshNode, MeshNodeRole } from "~/simulator/mesh-node";

const { logger } = useSimulator();
const logContainer = ref<HTMLDivElement>();

// Автоматическая прокрутка вниз при появлении новых логов
watch(
  () => logger.storage.length,
  () => {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight;
      }
    });
  },
);

const formatDate = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const getColorByNode = (node: MeshNode) => {
  if (node.role === MeshNodeRole.CLIENT) return "text-yellow-400";
  if (node.role === MeshNodeRole.CLIENT_MUTE) return "text-blue-400";
  if (node.role === MeshNodeRole.ROUTER) return "text-red-400";

  return "neutral";
};
</script>
