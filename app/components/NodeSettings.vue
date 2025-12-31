<template>
  <UForm
    v-if="node"
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <p>Настройки ноды #{{ node.id }}</p>
    <UFormField label="Лимит прыжков (hopLimit)" name="hopLimit">
      <UInputNumber v-model="state.hopLimit" />
    </UFormField>

    <UButton type="submit"> Применить </UButton>
  </UForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

const { nodeId } = defineProps<{ nodeId: number }>();
const { simulator } = useSimulator();

const node = computed(() => simulator.nodeById(nodeId));

const schema = z.object({
  hopLimit: z
    .number()
    .positive("Должен быть больше нуля")
    .max(7, "Не больше семи прыжков"),
  power: z.number().positive("Не может быть отрицательным").max(20),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  hopLimit: 3,
});

const onSubmit = (event: FormSubmitEvent<Schema>) => {
  if (!node.value) return;
  node.value.hopLimit = event.data.hopLimit;
};
</script>
