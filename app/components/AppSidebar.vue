<template>
  <div>
    <div
      class="flex flex-col gap-4 rounded-lg overflow-hidden bg-elevated/50 w-full p-4"
    >
      <div class="flex items-center justify-between">
        <AppLogo />

        <div class="flex">
          <UButton
            icon="i-lucide-panel-top-close"
            v-if="!compact"
            color="neutral"
            variant="ghost"
            @click="compact = true"
          ></UButton>
          <UButton
            icon="i-lucide-panel-top-open"
            v-else
            color="neutral"
            variant="ghost"
            @click="compact = false"
          ></UButton>

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
      <AppControls v-if="!compact" />
      <AppSettings v-if="!compact" />
    </div>
  </div>
</template>

<script setup lang="ts">
const compact = ref(false);
</script>
