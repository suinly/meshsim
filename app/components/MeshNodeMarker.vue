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
          v-if="node.isTransmitting"
          class="wave-expand absolute inset-0 flex items-center justify-center"
        >
          <div
            class="w-6 h-6 bg-green-400 rounded-full border-2 border-green-400"
          />
        </div>

        <!-- Эффект приема - синее кольцо -->
        <div
          v-if="node.isReceiving"
          class="receive-ring absolute inset-0 flex items-center justify-center"
        >
          <div
            class="w-6 h-6 bg-green-400 rounded-full border-2 border-green-400"
          />
        </div>

        <!-- Сама нода -->
        <div
          class="w-6 h-6 rounded-full shadow-lg relative z-10 text-center text-black font-bold text-xs/6 bg-green-400"
          :class="{ 'outline outline-blue-400': node.isSelected }"
        >
          {{ node.id }}
        </div>
      </div>
    </LIcon>
  </LMarker>
</template>

<script setup lang="ts">
import type { LeafletMouseEvent } from "leaflet";
import type { MeshNode } from "~/simulator/mesh-node";

const props = defineProps<{ node: MeshNode }>();

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

  if (event.originalEvent.metaKey || event.originalEvent.ctrlKey) {
    props.node.isSelected = !props.node.isSelected;
    return;
  }

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
  animation: expand-wave 1s ease-out infinite;
}

.receive-ring > div {
  animation: pulse-ring 0.6s ease-in-out;
  opacity: 0.8;
}
</style>
