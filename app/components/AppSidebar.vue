<template>
  <UCard variant="soft">
    <template #header>
      <UColorModeButton />

      <UButton
        to="https://github.com/"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>

    <template #footer>
      <UButton
        :color="isAddingMode ? 'primary' : 'neutral'"
        :variant="isAddingMode ? 'solid' : 'soft'"
        @click="emit('toggleAddingMode')"
      >
        {{ isAddingMode ? "Нажмите на карту для добавления" : "Добавить узел" }}
      </UButton>
    </template>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  isAddingMode: boolean;
}>();

const emit = defineEmits<{
  (e: "toggleAddingMode"): void;
}>();
</script>
