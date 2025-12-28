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
        <span class="text-neutral-500">Передано пакетов:</span>
        <span class="font-medium">{{ node.transmittedPackets.length }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-neutral-500">Принято пакетов:</span>
        <span class="font-medium">{{ node.receivedPackets.length }}</span>
      </div>
    </div>

    <div
      class="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2"
    >
      <UButton
        block
        color="neutral"
        variant="soft"
        icon="i-lucide-settings"
        size="sm"
        @click="emit('edit')"
      >
        Настройки
      </UButton>
      <UButton
        block
        color="primary"
        variant="solid"
        icon="i-lucide-send"
        size="sm"
        @click="emit('transmit')"
      >
        Передать пакет
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
</script>
