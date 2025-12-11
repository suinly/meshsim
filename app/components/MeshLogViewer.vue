<template>
  <div
    ref="logContainer"
    class="text-sm flex flex-col gap-1 overflow-y-auto max-h-full"
  >
    <div v-for="log in logger.storage" class="flex gap-2">
      <UBadge :color="log.type" variant="outline">{{
        formatDate(log.createdAt)
      }}</UBadge>
      <UBadge
        :color="getColorByNode(log.node)"
        variant="outline"
        v-if="log.node"
        >{{ log.node.id }}</UBadge
      >

      <span>{{ log.message }}</span>
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
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};

const getColorByNode = (node: MeshNode) => {
  if (node.role === MeshNodeRole.CLIENT) return "warning";
  if (node.role === MeshNodeRole.CLIENT_MUTE) return "info";
  if (node.role === MeshNodeRole.ROUTER) return "error";

  return "neutral";
};
</script>
