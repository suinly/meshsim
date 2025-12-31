<template>
  <div class="space-y-3">
    <div class="space-y-3">
      <div>
        <label class="text-xs text-neutral-500 block mb-2"
          >Лимит прыжков: {{ localForm.hopLimit }}</label
        >
        <USlider v-model="localForm.hopLimit" :min="1" :max="7" :step="1" />
      </div>

      <div>
        <label class="text-xs text-neutral-500 block mb-2"
          >Мощность: {{ localForm.power }} дБм</label
        >
        <USlider v-model="localForm.power" :min="1" :max="30" :step="1" />
        <p class="text-xs text-neutral-500 mt-1">
          Дальность: {{ calculateRange(localForm.power) }}
        </p>
      </div>
    </div>

    <div
      class="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2"
    >
      <UButton
        block
        color="primary"
        variant="solid"
        icon="i-lucide-check"
        size="sm"
        @click="handleApply"
      >
        Применить
      </UButton>
      <UButton
        block
        color="neutral"
        variant="ghost"
        icon="i-lucide-x"
        size="sm"
        @click="emit('cancel')"
      >
        Отмена
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BaseNode } from "~/simulator/BaseNode";

const props = defineProps<{
  node: BaseNode;
}>();

const emit = defineEmits<{
  (e: "apply", settings: { hopLimit: number; power: number }): void;
  (e: "cancel"): void;
}>();

const localForm = reactive({
  hopLimit: props.node.hopLimit,
  power: props.node.power,
});

function handleApply() {
  emit("apply", {
    hopLimit: localForm.hopLimit,
    power: localForm.power,
  });
}

// Сбрасываем форму при изменении узла
watch(
  () => props.node,
  (node) => {
    localForm.hopLimit = node.hopLimit;
    localForm.power = node.power;
  },
);

function calculateRange(power: number): string {
  // Используем ту же формулу, что и в симуляторе
  const basePower = 20; // дБм
  const baseRange = 5000; // метров

  const powerDifference = power - basePower;
  const rangeFactor = Math.pow(10, powerDifference / 20);
  const range = baseRange * rangeFactor;

  // Форматируем для отображения
  if (range >= 1000) {
    return `${(range / 1000).toFixed(1)} км`;
  }
  return `${Math.round(range)} м`;
}
</script>
