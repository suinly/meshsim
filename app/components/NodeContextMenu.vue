<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        :style="{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: zIndex,
        }"
        class="bg-elevated/95 backdrop-blur-md rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800"
        :class="{
          'animate-highlight': isActive,
        }"
        @click.stop
        @mousedown.stop="handleMouseDown"
        @touchstart.stop="handleTouchStart"
      >
        <div class="w-[230px]">
          <!-- Заголовок с кнопкой закрытия (перетаскиваемая область) -->
          <div
            class="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-800 cursor-move select-none active:cursor-grabbing"
            :class="{ 'cursor-grabbing': isDragging }"
            @mousedown="startDrag"
            @touchstart="startDragTouch"
          >
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-grip-vertical" class="text-neutral-400" />
              <span class="font-semibold text-sm">Узел #{{ node.id }}</span>
            </div>
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              @click.stop="emit('close')"
              @touchstart.stop.prevent="emit('close')"
            />
          </div>

          <div class="p-3">
            <!-- Режим просмотра -->
            <NodeInfo
              v-if="!isEditMode"
              :node="node"
              @transmit="transmitPacket"
              @edit="isEditMode = true"
              @remove="removeNode"
            />

            <!-- Режим редактирования -->
            <NodeSettingsForm
              v-else
              :node="node"
              @apply="applySettings"
              @cancel="cancelEdit"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { BaseNode } from "~/simulator/BaseNode";

const props = defineProps<{
  node: BaseNode;
  isOpen: boolean;
  initialPosition: { x: number; y: number };
  highlightTrigger: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update:position", position: { x: number; y: number }): void;
}>();

// Симулятор для передачи пакетов
const { simulator } = useSimulator();

// Управление слоями окон
const { zIndex, bringToFront } = useWindowStack();
const isActive = ref(false);

// Состояние меню
const isEditMode = ref(false);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const position = ref({ x: 0, y: 0 });

// Инициализируем позицию при открытии
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      position.value = { ...props.initialPosition };
      isEditMode.value = false;
      bringToFront();
      activateWindow();
    }
  },
  { immediate: true },
);

// Подсветка окна при повторном клике на узел
watch(
  () => props.highlightTrigger,
  (newValue, oldValue) => {
    if (newValue !== oldValue && props.isOpen) {
      bringToFront();
      activateWindow();
    }
  },
);

// Обработка активации окна
function activateWindow() {
  isActive.value = true;
  setTimeout(() => {
    isActive.value = false;
  }, 600);
}

function handleMouseDown() {
  bringToFront();
}

function handleTouchStart() {
  bringToFront();
}

function transmitPacket() {
  simulator.transmitFromNode(props.node);
}

function removeNode() {
  simulator.removeNode(props.node);
}

function applySettings(settings: {
  hopLimit: number;
  power: number;
  height: number;
}) {
  props.node.hopLimit = settings.hopLimit;
  props.node.power = settings.power;
  props.node.height = settings.height;
  isEditMode.value = false;
}

function cancelEdit() {
  isEditMode.value = false;
}

// Перетаскивание меню (мышь)
function startDrag(event: MouseEvent) {
  event.stopPropagation();
  bringToFront();

  isDragging.value = true;
  dragStart.value = {
    x: event.clientX - position.value.x,
    y: event.clientY - position.value.y,
  };

  const onMouseMove = (e: MouseEvent) => {
    if (isDragging.value) {
      position.value = {
        x: e.clientX - dragStart.value.x,
        y: e.clientY - dragStart.value.y,
      };
      emit("update:position", position.value);
    }
  };

  const onMouseUp = () => {
    isDragging.value = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

// Перетаскивание меню (touch)
function startDragTouch(event: TouchEvent) {
  event.stopPropagation();
  event.preventDefault();
  if (event.touches.length !== 1) return;

  bringToFront();

  const touch = event.touches[0];

  if (!touch) return;

  isDragging.value = true;
  dragStart.value = {
    x: touch.clientX - position.value.x,
    y: touch.clientY - position.value.y,
  };

  const onTouchMoveHandler = (e: TouchEvent) => {
    if (isDragging.value && e.touches.length === 1) {
      e.preventDefault();
      const t = e.touches[0];

      if (!t) return;

      position.value = {
        x: t.clientX - dragStart.value.x,
        y: t.clientY - dragStart.value.y,
      };
      emit("update:position", position.value);
    }
  };

  const onTouchEndHandler = () => {
    isDragging.value = false;
    document.removeEventListener("touchmove", onTouchMoveHandler);
    document.removeEventListener("touchend", onTouchEndHandler);
  };

  document.addEventListener("touchmove", onTouchMoveHandler, {
    passive: false,
  });
  document.addEventListener("touchend", onTouchEndHandler);
}
</script>

<style scoped>
@keyframes highlight {
  0%,
  100% {
    box-shadow:
      0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1);
  }
  50% {
    box-shadow:
      0 25px 50px -12px rgb(0 0 0 / 0.25),
      0 0 0 2px rgb(34 197 94 / 0.3),
      0 0 12px 1px rgb(34 197 94 / 0.2);
  }
}

.animate-highlight {
  animation: highlight 0.6s ease-in-out;
}
</style>
