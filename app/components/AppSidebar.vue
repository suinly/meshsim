<template>
  <UCard variant="soft">
    <template #header>
      <div class="flex items-center justify-between">
        <AppLogo />

        <div class="flex">
          <UColorModeButton />

          <UButton
            to="https://github.com/suinly/meshsim"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
            color="neutral"
            variant="ghost"
          />
        </div>
      </div>
    </template>

    <div class="mb-4 flex gap-2">
      <UButton
        icon="i-lucide-plus"
        :color="isAddingMode ? 'primary' : 'neutral'"
        :variant="isAddingMode ? 'solid' : 'soft'"
        @click="emit('toggle-adding-mode')"
      >
      </UButton>

      <UButton
        icon="i-lucide-hand"
        :color="!isAddingMode ? 'primary' : 'neutral'"
        :variant="!isAddingMode ? 'solid' : 'soft'"
        @click="emit('toggle-adding-mode')"
      >
      </UButton>
    </div>

    <AppSettings />

    <template #footer> Нод на карте: {{ simulator.nodes.length }} </template>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  isAddingMode: boolean;
}>();

const simulator = useSimulator();

const emit = defineEmits<{
  (e: "toggle-adding-mode"): void;
}>();
</script>
