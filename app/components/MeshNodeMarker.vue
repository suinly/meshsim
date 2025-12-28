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
      <div
        class="relative w-[30px] h-[30px] flex items-center justify-center"
        @touchstart.stop="onTouchStart"
        @touchend.stop="onTouchEnd"
        @touchmove.stop="onTouchMove"
      >
        <!-- Индикатор выбора -->
        <div
          v-if="isSelected"
          class="absolute inset-0 flex items-center justify-center"
        >
          <div
            class="w-8 h-8 rounded-full border-2 border-primary-500 bg-primary-500/20"
          />
        </div>

        <!-- Индикатор долгого нажатия -->
        <div
          v-if="isLongPressing"
          class="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div
            class="w-10 h-10 rounded-full border-3 border-primary-500 bg-primary-500/40 long-press-ring"
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
            'ring-4 ring-red-500': isLongPressing,
          }"
        >
          {{ node.id }}
        </div>
      </div>
    </LIcon>
  </LMarker>

  <!-- Контекстное меню -->
  <NodeContextMenu
    :node="node"
    :is-open="isContextMenuOpen"
    :initial-position="menuPosition"
    :highlight-trigger="highlightTrigger"
    @close="closeMenu"
    @update:position="menuPosition = $event"
  />
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
}>();

// Состояние контекстного меню
const isContextMenuOpen = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const isLongPressing = ref(false);
const highlightTrigger = ref(0);

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

  // Если меню уже открыто, просто подсвечиваем его
  if (isContextMenuOpen.value) {
    highlightTrigger.value++;
    return;
  }

  const mouseEvent = event.originalEvent;
  const menuWidth = 220;
  const menuHeight = 220;

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let x = mouseEvent.clientX;
  let y = mouseEvent.clientY;

  if (x + menuWidth > windowWidth) {
    x = windowWidth - menuWidth - 10;
  }

  if (y + menuHeight > windowHeight) {
    y = windowHeight - menuHeight - 10;
  }

  x = Math.max(10, x);
  y = Math.max(10, y);

  menuPosition.value = { x, y };
  isContextMenuOpen.value = true;
}

function closeMenu() {
  isContextMenuOpen.value = false;
}

// Поддержка долгого нажатия для мобильных устройств
let longPressTimer: ReturnType<typeof setTimeout> | null = null;
const longPressDuration = 500;

function onTouchStart(event: TouchEvent) {
  event.preventDefault();
  isLongPressing.value = true;

  longPressTimer = setTimeout(() => {
    // Если меню уже открыто, просто подсвечиваем его
    if (isContextMenuOpen.value) {
      highlightTrigger.value++;
      isLongPressing.value = false;
      return;
    }

    if (event.touches && event.touches.length === 1) {
      const touch = event.touches[0];
      const menuWidth = 220;
      const menuHeight = 350;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let x = touch.clientX;
      let y = touch.clientY;

      if (x + menuWidth > windowWidth) {
        x = windowWidth - menuWidth - 10;
      }

      if (y + menuHeight > windowHeight) {
        y = windowHeight - menuHeight - 10;
      }

      x = Math.max(10, x);
      y = Math.max(10, y);

      menuPosition.value = { x, y };
      isContextMenuOpen.value = true;
    }
    isLongPressing.value = false;
  }, longPressDuration);
}

function onTouchEnd(event: TouchEvent) {
  event.preventDefault();
  isLongPressing.value = false;

  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

function onTouchMove() {
  isLongPressing.value = false;

  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
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

/* Анимация долгого нажатия */
@keyframes long-press {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(0.5);
    opacity: 0;
  }
}

.wave-expand > div {
  animation: expand-wave 0.6s ease-out infinite;
}

.receive-ring > div {
  animation: pulse-ring 0.6s ease-in-out;
  opacity: 0.8;
}

.long-press-ring {
  animation: long-press 0.5s ease-in-out infinite;
}
</style>
