<template>
  <UForm
    :schema="schema"
    :state="state"
  >
    <UFormField
      label="Лимит прыжков для новых узлов"
      name="hopLimit"
    >
      <UInputNumber v-model="state.hopLimit" />
    </UFormField>
  </UForm>
</template>

<script setup lang="ts">
import * as z from 'zod'

const schema = z.object({
  hopLimit: z.number().positive('Не может быть отрицательным').max(7)
})

type Schema = z.output<typeof schema>

const { hopLimit } = useSimulatorSettings()

const state = reactive<Partial<Schema>>({
  hopLimit: hopLimit.value
})

watch(() => state.hopLimit, (newValue) => {
  if (newValue !== undefined) {
    hopLimit.value = newValue
  }
})
</script>
