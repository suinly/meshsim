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

          <div class="p-3 space-y-3">
            <!-- Режим просмотра -->
            <template v-if="!isEditMode">
              <div class="space-y-1 text-xs">
                <div class="flex justify-between">
                  <span class="text-neutral-500">Роль:</span>
                  <span class="font-medium">{{ getRoleLabel(node.role) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-500">Состояние:</span>
                  <span class="font-medium">{{
                    getStateLabel(node.state)
                  }}</span>
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
                  <span class="font-medium">{{
                    node.transmittedPackets.length
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-500">Принято пакетов:</span>
                  <span class="font-medium">{{
                    node.receivedPackets.length
                  }}</span>
                </div>
              </div>

              <div
                class="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2"
              >
                <UButton
                  block
                  color="primary"
                  variant="solid"
                  icon="i-lucide-send"
                  size="sm"
                  @click="transmitPacket"
                >
                  Передать пакет
                </UButton>
                <UButton
                  block
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-settings"
                  size="sm"
                  @click="isEditMode = true"
                >
                  Настройки
                </UButton>
              </div>
            </template>

            <!-- Режим редактирования -->
            <template v-else>
              <div class="space-y-3">
                <div>
                  <label class="text-xs text-neutral-500 block mb-1"
                    >Лимит прыжков</label
                  >
                  <UInput
                    v-model.number="editForm.hopLimit"
                    type="number"
                    min="1"
                    max="7"
                    size="sm"
                  />
                  <p class="text-xs text-neutral-500 mt-1">От 1 до 7 прыжков</p>
                </div>

                <div>
                  <label class="text-xs text-neutral-500 block mb-1"
                    >Мощность (дБм)</label
                  >
                  <UInput
                    v-model.number="editForm.power"
                    type="number"
                    min="1"
                    max="20"
                    size="sm"
                  />
                  <p class="text-xs text-neutral-500 mt-1">От 1 до 20 дБм</p>
                </div>
              </div>

              <div
                class="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex gap-2"
              >
                <UButton
                  block
                  color="primary"
                  variant="solid"
                  icon="i-lucide-check"
                  @click="applySettings"
                >
                  Применить
                </UButton>
                <UButton
                  block
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-x"
                  @click="cancelEdit"
                >
                  Отмена
                </UButton>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { BaseNode } from "~/simulator/BaseNode";
import { NodeRole } from "~/simulator/NodeRole";
import { NodeState } from "~/simulator/NodeState";

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

// Форма редактирования
const editForm = reactive({
  hopLimit: 3,
  power: 20,
});

// Инициализируем позицию при открытии
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      position.value = { ...props.initialPosition };
      editForm.hopLimit = props.node.hopLimit;
      editForm.power = props.node.power;
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

function transmitPacket() {
  simulator.transmitFromNode(props.node);
}

function applySettings() {
  props.node.hopLimit = editForm.hopLimit;
  props.node.power = editForm.power;
  isEditMode.value = false;
  emit("close");
}

function cancelEdit() {
  editForm.hopLimit = props.node.hopLimit;
  editForm.power = props.node.power;
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
  isDragging.value = true;
  dragStart.value = {
    x: touch.clientX - position.value.x,
    y: touch.clientY - position.value.y,
  };

  const onTouchMoveHandler = (e: TouchEvent) => {
    if (isDragging.value && e.touches.length === 1) {
      e.preventDefault();
      const t = e.touches[0];
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
