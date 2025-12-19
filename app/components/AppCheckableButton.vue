<template>
  <UTooltip
    :delay-duration="0"
    :text="tooltip"
    :disabled="!tooltip"
    :content="{ side: 'top' }"
  >
    <UButton
      :icon="icon"
      :color="checked ? color : 'neutral'"
      :variant="checked ? 'solid' : 'soft'"
    />
  </UTooltip>
</template>

<script setup lang="ts">
const {
  color = 'primary',
  icon,
  checked = false,
  tooltip
} = defineProps<{
  icon: string
  color?:
    | 'error'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'neutral'
  checked?: boolean
  tooltip?: string
}>()
</script>
