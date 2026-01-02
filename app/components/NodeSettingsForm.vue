<template>
  <div class="space-y-3">
    <div class="space-y-3">
      <div>
        <label class="text-xs text-neutral-500 block mb-2">Тип узла</label>
        <div class="flex gap-2">
          <AppCheckableButton
            icon="i-lucide-circle-dot"
            tooltip="CLIENT"
            color="warning"
            :checked="localForm.role == NodeRole.CLIENT"
            @click="localForm.role = NodeRole.CLIENT"
          />
          <AppCheckableButton
            icon="i-lucide-circle-x"
            tooltip="CLIENT_MUTE"
            color="secondary"
            :checked="localForm.role == NodeRole.CLIENT_MUTE"
            @click="localForm.role = NodeRole.CLIENT_MUTE"
          />
          <AppCheckableButton
            icon="i-lucide-circle-alert"
            tooltip="ROUTER"
            color="error"
            :checked="localForm.role == NodeRole.ROUTER"
            @click="localForm.role = NodeRole.ROUTER"
          />
        </div>
      </div>

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
          Дальность: {{ calculateRange(localForm.power, localForm.height) }}
        </p>
      </div>

      <div>
        <label class="text-xs text-neutral-500 block mb-2"
          >Высота: {{ localForm.height }} м</label
        >
        <USlider v-model="localForm.height" :min="0" :max="200" :step="1" />
        <p class="text-xs text-neutral-500 mt-1">От уровня земли до 200м</p>
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
import { NodeRole } from "~/simulator/NodeRole";

const props = defineProps<{
  node: BaseNode;
}>();

const emit = defineEmits<{
  (
    e: "apply",
    settings: { hopLimit: number; power: number; height: number; role: NodeRole },
  ): void;
  (e: "cancel"): void;
}>();

const localForm = reactive({
  role: props.node.role,
  hopLimit: props.node.hopLimit,
  power: props.node.power,
  height: props.node.height,
});

function handleApply() {
  emit("apply", {
    role: localForm.role,
    hopLimit: localForm.hopLimit,
    power: localForm.power,
    height: localForm.height,
  });
}

// Сбрасываем форму при изменении узла
watch(
  () => props.node,
  (node) => {
    localForm.role = node.role;
    localForm.hopLimit = node.hopLimit;
    localForm.power = node.power;
    localForm.height = node.height;
  },
);

function calculateRange(power: number, height: number): string {
  // Используем ту же формулу, что и в симуляторе
  const basePower = 20; // дБм
  const baseRange = 600; // метров на высоте 0м

  // Влияние мощности
  const powerDifference = power - basePower;
  const powerFactor = Math.pow(10, powerDifference / 20);
  const powerAdjustedRange = baseRange * powerFactor;

  // Влияние высоты: линейная модель от 600м до 50км
  const maxRangeAtMaxHeight = 50000;
  const maxHeight = 200;
  const heightBonus = (height / maxHeight) * (maxRangeAtMaxHeight - baseRange);

  const range = powerAdjustedRange + heightBonus;

  // Форматируем для отображения
  if (range >= 1000) {
    return `${(range / 1000).toFixed(1)} км`;
  }
  return `${Math.round(range)} м`;
}
</script>
