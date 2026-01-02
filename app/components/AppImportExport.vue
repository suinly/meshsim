<template>
  <div class="flex flex-col gap-2">
    <p class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
      Импорт/Экспорт
    </p>

    <!-- Кнопка экспорта -->
    <UButton
      block
      color="primary"
      variant="outline"
      icon="i-lucide-download"
      :disabled="simulator.nodes.length === 0"
      @click="exportNodes"
    >
      Экспорт узлов
    </UButton>

    <!-- Кнопка импорта -->
    <UButton
      block
      color="primary"
      variant="outline"
      icon="i-lucide-upload"
      @click="triggerImport"
    >
      Импорт узлов
    </UButton>

    <!-- Скрытый file input -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
const { simulator } = useSimulator();
const fileInput = ref<HTMLInputElement | null>(null);

// Экспорт узлов в JSON файл
function exportNodes() {
  const json = simulator.exportNodes();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mesh-nodes-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Открыть диалог выбора файла
function triggerImport() {
  fileInput.value?.click();
}

// Обработка выбранного файла
async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  try {
    const text = await file.text();
    simulator.importNodes(text);

    // Сбрасываем input для возможности повторного импорта того же файла
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  } catch (error) {
    console.error("Ошибка импорта:", error);
    alert(`Ошибка импорта: ${error}`);
  }
}
</script>
