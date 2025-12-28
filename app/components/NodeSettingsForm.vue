<template>
  <div class="space-y-3">
    <div class="space-y-3">
      <div>
        <label class="text-xs text-neutral-500 block mb-1">Лимит прыжков</label>
        <UInput
          v-model.number="localForm.hopLimit"
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
          v-model.number="localForm.power"
          type="number"
          min="1"
          max="20"
          size="sm"
        />
        <p class="text-xs text-neutral-500 mt-1">От 1 до 20 дБм</p>
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
</script>
