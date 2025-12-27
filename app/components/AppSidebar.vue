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
      <template v-if="!compact">
        <AppControls />
        <p>Глобальные настройки</p>
        <AppSettings />
        <AppStatistic v-if="!compact" />
      </template>
    </div>

    <div
      v-if="simulator.selectedNodes.size > 0"
      class="flex flex-col gap-4 rounded-lg overflow-hidden bg-elevated/50 w-full p-4 mt-4"
    >
      <template v-for="nodeId in simulator.selectedNodes.values()">
        <NodeSettings :nodeId="nodeId" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const compact = ref(false);
const { simulator } = useSimulator();
</script>
