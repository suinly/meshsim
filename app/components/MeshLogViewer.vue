<template>
  <div ref="logContainer" class="flex flex-col gap-1 overflow-y-auto">
    <div
      v-for="(log, index) in logger.storage"
      :key="index"
      class="font-mono text-xs"
    >
      <span
        :class="{
          'text-red-400': log.type === LogEntityType.ERROR,
          'text-yellow-400': log.type === LogEntityType.WARNING,
          'text-green-400': log.type === LogEntityType.SUCCESS,
        }"
      >
        [{{ formatDate(log.createdAt) }}]
      </span>
      <span v-if="log.node" :class="getColorByNode(log.node)">
        [{{ log.node.id }}]
      </span>
      <span>
        {{ log.message }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BaseNode } from "~/simulator/BaseNode";
import { LogEntityType } from "~/simulator/LogEntityType";
import { NodeRole } from "~/simulator/NodeRole";

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

const formatDate = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const getColorByNode = (node: BaseNode): string => {
  if (node.role === NodeRole.CLIENT) return "text-yellow-400";
  if (node.role === NodeRole.CLIENT_MUTE) return "text-blue-400";
  if (node.role === NodeRole.ROUTER) return "text-red-400";

  return "";
};
</script>
