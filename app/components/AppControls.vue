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
  </div>
</template>

<script setup lang="ts">
import { NodeRole } from "~/simulator/NodeRole";
import { SimulatorMode } from "~/simulator/SimulatorMode";

const { simulator, logger } = useSimulator();
const { defaultRole } = useSimulatorSettings();

const changeDefaultRole = (role: NodeRole) => {
  defaultRole.value = role;
};

const clearNodes = () => {
  simulator.nodes = [];
  logger.warning("Карта очищена");
};
</script>
