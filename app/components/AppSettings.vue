<template>
  <UForm :schema="schema" :state="state">
    <UFormField name="hopLimit">
      <template #label
        >Лимит прыжков для новых узлов ({{ state.hopLimit }})</template
      >
      <USlider v-model="state.hopLimit" :min="1" :max="7" :step="1" />
    </UFormField>

    <UFormField name="defaultHeight" class="mt-2 mb-2">
      <template #label
        >Высота новых узлов ({{ state.defaultHeight }}м)</template
      >
      <USlider
        v-model="state.defaultHeight"
        :min="0"
        :max="200"
        :step="1"
        class="mt-2"
      />
    </UFormField>
  </UForm>
</template>

<script setup lang="ts">
import * as z from "zod";

const schema = z.object({
  hopLimit: z.number().positive("Не может быть отрицательным").max(7),
  defaultHeight: z.number().positive("Не может быть отрицательным").max(200),
});

type Schema = z.output<typeof schema>;

const { hopLimit, defaultHeight } = useSimulatorSettings();

const state = reactive<Partial<Schema>>({
  hopLimit: hopLimit.value,
  defaultHeight: defaultHeight.value,
});

watch(
  () => state.hopLimit,
  (newValue) => {
    if (newValue !== undefined) {
      hopLimit.value = newValue;
    }
  },
);

watch(
  () => state.defaultHeight,
  (newValue) => {
    if (newValue !== undefined) {
      defaultHeight.value = newValue;
    }
  },
);
</script>
