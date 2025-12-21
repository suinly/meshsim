<template>
  <div class="app-controls">
    <div class="flex gap-2">
      <AppCheckableButton
        icon="i-lucide-plus"
        tooltip="Режим добавления узлов"
        :checked="simulator.mode == SimulatorMode.ADD"
        @click="simulator.mode = SimulatorMode.ADD"
      />
      <AppCheckableButton
        icon="i-lucide-hand"
        tooltip="Режим просмотра"
        :checked="simulator.mode == SimulatorMode.VIEW"
        @click="simulator.mode = SimulatorMode.VIEW"
      />

      <UTooltip
        :delay-duration="0"
        text="Очистить карту"
        :content="{ side: 'top' }"
      >
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-x"
          :disabled="!simulator.nodes.length"
          @click="clearNodes"
        />
      </UTooltip>
    </div>

    <div v-if="simulator.mode == SimulatorMode.ADD" class="flex gap-2 mt-4">
      <AppCheckableButton
        icon="i-lucide-circle-dot"
        tooltip="CLIENT"
        color="warning"
        :checked="defaultRole == NodeRole.CLIENT"
        @click="changeDefaultRole(NodeRole.CLIENT)"
      />
      <AppCheckableButton
        icon="i-lucide-circle-x"
        tooltip="CLIENT_MUTE"
        color="secondary"
        :checked="defaultRole == NodeRole.CLIENT_MUTE"
        @click="changeDefaultRole(NodeRole.CLIENT_MUTE)"
      />
      <AppCheckableButton
        icon="i-lucide-circle-alert"
        tooltip="ROUTER"
        color="error"
        :checked="defaultRole == NodeRole.ROUTER"
        @click="changeDefaultRole(NodeRole.ROUTER)"
      />
    </div>

    <div
      v-if="simulator.mode == SimulatorMode.ADD"
      class="mt-3 text-sm text-gray-600 dark:text-gray-400"
    >
      {{ roleDescription }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { NodeRole } from "~/simulator/NodeRole";
import { SimulatorMode } from "~/simulator/SimulatorMode";

const { simulator, logger } = useSimulator();
const { defaultRole } = useSimulatorSettings();

const roleDescriptions = {
  [NodeRole.CLIENT]:
    "Задержка ретрансляции зависит от SNR (0-2000 мс). Не ретранслирует повторно услышанные пакеты.",
  [NodeRole.CLIENT_MUTE]:
    "Только принимает пакеты, никогда не ретранслирует. Используется для конечных устройств.",
  [NodeRole.ROUTER]:
    "Мгновенная ретрансляция (0 мс). Не уменьшает hopLimit для пакетов от избранных узлов (в разработке).",
};

const roleDescription = computed(() => {
  return roleDescriptions[defaultRole.value] || "";
});

const changeDefaultRole = (role: NodeRole) => {
  defaultRole.value = role;
};

const clearNodes = () => {
  simulator.nodes = [];
  logger.warning("Карта очищена");
};
</script>
