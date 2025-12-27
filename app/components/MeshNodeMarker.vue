<template>
  <LMarker
    :key="node.id"
    :lat-lng="[node.lat, node.lng]"
    :draggable="true"
    @click="onClick"
    @dragend="onDragEnd"
    @contextmenu="onContextMenu"
  >
    <LIcon :icon-size="[30, 30]" :icon-anchor="[15, 15]">
      <div class="relative w-[30px] h-[30px] flex items-center justify-center">
        <!-- Индикатор выбора -->
        <div
          v-if="isSelected"
          class="absolute inset-0 flex items-center justify-center"
        >
          <div
            class="w-8 h-8 rounded-full border-2 border-primary-500 bg-primary-500/20"
          />
        </div>

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

  <!-- Контекстное меню -->
  <UContextMenu v-model:open="isContextMenuOpen" :virtual-element="virtualElement">
    <div class="p-3 space-y-2 min-w-[250px]">
      <div class="font-semibold text-sm border-b pb-2">Узел #{{ node.id }}</div>

      <div class="space-y-1 text-xs">
        <div class="flex justify-between">
          <span class="text-neutral-500">Роль:</span>
          <span class="font-medium">{{ getRoleLabel(node.role) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-neutral-500">Состояние:</span>
          <span class="font-medium">{{ getStateLabel(node.state) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-neutral-500">Лимит прыжков:</span>
          <span class="font-medium">{{ node.hopLimit }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-neutral-500">Мощность:</span>
          <span class="font-medium">{{ node.power }} дБм</span>
        </div>
        <div class="flex justify-between">
          <span class="text-neutral-500">Передано пакетов:</span>
          <span class="font-medium">{{ node.transmittedPackets.length }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-neutral-500">Принято пакетов:</span>
          <span class="font-medium">{{ node.receivedPackets.length }}</span>
        </div>
      </div>

      <div class="pt-2 border-t">
        <UButton
          block
          color="primary"
          variant="soft"
          icon="i-lucide-settings"
          @click="openSettings"
        >
          Настройки
        </UButton>
      </div>
    </div>
  </UContextMenu>
</template>

<script setup lang="ts">
import type { LeafletMouseEvent } from "leaflet";
import type { BaseNode } from "~/simulator/BaseNode";
import { NodeRole } from "~/simulator/NodeRole";
import { NodeState } from "~/simulator/NodeState";

const props = defineProps<{
  node: BaseNode;
  isSelected?: boolean;
}>();

const emit = defineEmits<{
  (e: "moved", lat: number, lng: number): void;
  (e: "click", event: MouseEvent): void;
  (e: "openSettings"): void;
}>();

const { simulator } = useSimulator();

// Состояние контекстного меню
const isContextMenuOpen = ref(false);
const virtualElement = ref({ getBoundingClientRect: () => ({}) });

function onDragEnd(event: LeafletMouseEvent) {
  const { lat, lng } = event.target.getLatLng();
  emit("moved", lat, lng);
}

function onClick(event: LeafletMouseEvent) {
  event.originalEvent.stopPropagation();
  emit("click", event.originalEvent);
}

function onContextMenu(event: LeafletMouseEvent) {
  event.originalEvent.preventDefault();
  event.originalEvent.stopPropagation();

  const mouseEvent = event.originalEvent;

  // Создаем виртуальный элемент для позиционирования меню
  virtualElement.value = {
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      x: mouseEvent.clientX,
      y: mouseEvent.clientY,
      top: mouseEvent.clientY,
      left: mouseEvent.clientX,
      right: mouseEvent.clientX,
      bottom: mouseEvent.clientY,
    }),
  };

  isContextMenuOpen.value = true;
}

function getRoleLabel(role: NodeRole): string {
  switch (role) {
    case NodeRole.CLIENT:
      return "Клиент";
    case NodeRole.CLIENT_MUTE:
      return "Клиент (без ретрансляции)";
    case NodeRole.ROUTER:
      return "Роутер";
    default:
      return "Неизвестно";
  }
}

function getStateLabel(state: NodeState): string {
  switch (state) {
    case NodeState.LISTENING:
      return "Слушает";
    case NodeState.TRANSMITING:
      return "Передает";
    case NodeState.RECEIVING:
      return "Принимает";
    default:
      return "Неизвестно";
  }
}

function openSettings() {
  isContextMenuOpen.value = false;
  simulator.selectedNodes.clear();
  simulator.selectedNodes.add(props.node.id);
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
