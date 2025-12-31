<template>
  <div class="space-y-3">
    <div class="space-y-1 text-xs">
      <div class="flex justify-between">
        <span class="text-neutral-500">Роль:</span>
        <span class="font-medium">{{ getRoleLabel(node.role) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-neutral-500">Состояние:</span>
        <span class="font-medium">{{ getStateLabel(node.state) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-neutral-500">Лимит прыжков:</span>
        <span class="font-medium">{{ node.hopLimit }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-neutral-500">Мощность:</span>
        <span class="font-medium">{{ node.power }} дБм</span>
      </div>
      <div class="flex justify-between">
        <span class="text-neutral-500">Дальность:</span>
        <span class="font-medium">{{ calculateRange(node.power) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-neutral-500">Передано пакетов:</span>
        <span class="font-medium">{{ node.transmittedPackets.length }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-neutral-500">Принято пакетов:</span>
        <span class="font-medium">{{ node.receivedPackets.length }}</span>
      </div>
    </div>

    <div
      class="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-x-1"
    >
      <UButton
        color="primary"
        variant="solid"
        icon="i-lucide-send"
        size="sm"
        @click="emit('transmit')"
      >
        Передать пакет
      </UButton>
      <UButton
        color="neutral"
        variant="soft"
        icon="i-lucide-settings"
        size="sm"
        @click="emit('edit')"
      >
      </UButton>
      <UButton
        color="neutral"
        variant="soft"
        icon="i-lucide-trash"
        size="sm"
        @click="emit('remove')"
      >
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BaseNode } from "~/simulator/BaseNode";
import { NodeRole } from "~/simulator/NodeRole";
import { NodeState } from "~/simulator/NodeState";

defineProps<{
  node: BaseNode;
}>();

const emit = defineEmits<{
  (e: "transmit"): void;
  (e: "edit"): void;
  (e: "remove"): void;
}>();

function getRoleLabel(role: NodeRole): string {
  switch (role) {
    case NodeRole.CLIENT:
      return "Клиент";
    case NodeRole.CLIENT_MUTE:
      return "Клиент (без ретрансляции)";
    case NodeRole.ROUTER:
      return "Роутер";
    default:
      return "Неизвестно";
  }
}

function getStateLabel(state: NodeState): string {
  switch (state) {
    case NodeState.LISTENING:
      return "Слушает";
    case NodeState.TRANSMITING:
      return "Передает";
    case NodeState.RECEIVING:
      return "Принимает";
    default:
      return "Неизвестно";
  }
}

function calculateRange(power: number): string {
  // Используем ту же формулу, что и в симуляторе
  const basePower = 20; // дБм
  const baseRange = 5000; // метров

  const powerDifference = power - basePower;
  const rangeFactor = Math.pow(10, powerDifference / 20);
  const range = baseRange * rangeFactor;

  // Форматируем для отображения
  if (range >= 1000) {
    return `${(range / 1000).toFixed(1)} км`;
  }
  return `${Math.round(range)} м`;
}
</script>
