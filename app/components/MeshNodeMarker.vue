<template>
  <LMarker
    :key="node.id"
    :lat-lng="[node.lat, node.lng]"
    :draggable="true"
    @click="onClick"
    @dragend="onDragEnd"
  >
    <LIcon :icon-size="[30, 30]" :icon-anchor="[15, 15]">
      <div class="relative w-[30px] h-[30px] flex items-center justify-center">
        <!-- Волна передачи - расходится от ноды -->
        <div
          v-if="node.state === NodeState.TRANSMITING"
          class="wave-expand absolute inset-0 flex items-center justify-center"
        >
          <div
            class="w-6 h-6 rounded-full border-2"
            :class="{
              'bg-warning-400 border-warning-400':
                node.role === NodeRole.CLIENT,
              'bg-secondary-400 border-secondary-400':
                node.role === NodeRole.CLIENT_MUTE,
              'bg-error-400 border-error-400': node.role === NodeRole.ROUTER,
            }"
          />
        </div>

        <!-- Эффект приема -->
        <div
          v-if="node.state === NodeState.RECEIVING"
          class="receive-ring absolute inset-0 flex items-center justify-center"
        >
          <div
            class="w-6 h-6 rounded-full border-2"
            :class="{
              'bg-warning-400 border-warning-400':
                node.role === NodeRole.CLIENT,
              'bg-secondary-400 border-secondary-400':
                node.role === NodeRole.CLIENT_MUTE,
              'bg-error-400 border-error-400': node.role === NodeRole.ROUTER,
            }"
          />
        </div>

        <!-- Сама нода -->
        <div
          class="w-6 h-6 rounded-full shadow-lg relative z-10 text-center text-black font-bold text-xs/6"
          :class="{
            'bg-warning-400': node.role === NodeRole.CLIENT,
            'bg-secondary-400': node.role === NodeRole.CLIENT_MUTE,
            'bg-error-400': node.role === NodeRole.ROUTER,
          }"
        >
          {{ node.id }}
        </div>
      </div>
    </LIcon>
  </LMarker>
</template>

<script setup lang="ts">
import type { LeafletMouseEvent } from "leaflet";
import type { BaseNode } from "~/simulator/BaseNode";
import { NodeRole } from "~/simulator/NodeRole";
import { NodeState } from "~/simulator/NodeState";

const props = defineProps<{ node: BaseNode }>();

const emit = defineEmits<{
  (e: "moved", lat: number, lng: number): void;
  (e: "click"): void;
}>();

function onDragEnd(event: LeafletMouseEvent) {
  const { lat, lng } = event.target.getLatLng();
  emit("moved", lat, lng);
}

function onClick(event: LeafletMouseEvent) {
  event.originalEvent.stopPropagation();
  emit("click");
}
</script>

<style scoped>
/* Анимация расходящейся волны при передаче */
@keyframes expand-wave {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

/* Пульсация кольца при приеме */
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

.wave-expand > div {
  animation: expand-wave 0.6s ease-out infinite;
}

.receive-ring > div {
  animation: pulse-ring 0.6s ease-in-out;
  opacity: 0.8;
}
</style>
