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
        <!-- Подсказка по взаимодействию с узлами -->
        <UAlert
          v-if="isHintOpen"
          color="primary"
          variant="soft"
          title="Взаимодействие с узлами:"
          :close="true"
          @update:open="handleAlertClose"
        >
          <template #description>
            <div class="text-xs space-y-1 mt-1">
              <div>• Клик / Тап — передать пакет</div>
              <div>• ПКМ / Долгое нажатие — меню узла</div>
            </div>
          </template>
        </UAlert>

        <AppControls />
        <p>Глобальные настройки</p>
        <AppSettings />
        <AppStatistic v-if="!compact" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const compact = ref(false);

// Управление подсказкой
const isHintOpen = ref(true);

onMounted(() => {
  // Проверяем, была ли подсказка закрыта ранее
  if (typeof localStorage !== "undefined") {
    isHintOpen.value = localStorage.getItem("nodeHintClosed") !== "true";
  }
});

function handleAlertClose(value: boolean) {
  isHintOpen.value = value;
  if (!value && typeof localStorage !== "undefined") {
    localStorage.setItem("nodeHintClosed", "true");
  }
}
</script>
