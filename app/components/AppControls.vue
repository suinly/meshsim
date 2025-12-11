<template>
  <div class="app-controls">
    <div class="flex gap-2">
      <AppCheckableButton
        icon="i-lucide-plus"
        tooltip="Режим добавления узлов"
        :checked="simulator.mode == MeshSimulatorMode.ADD"
        @click="simulator.mode = MeshSimulatorMode.ADD"
      />
      <AppCheckableButton
        icon="i-lucide-hand"
        tooltip="Режим просмотра"
        :checked="simulator.mode == MeshSimulatorMode.VIEW"
        @click="simulator.mode = MeshSimulatorMode.VIEW"
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
        >
        </UButton
      ></UTooltip>
    </div>

    <div class="flex gap-2 mt-4" v-if="simulator.mode == MeshSimulatorMode.ADD">
      <AppCheckableButton
        icon="i-lucide-circle-dot"
        tooltip="CLIENT"
        color="warning"
        :checked="defaultRole == MeshNodeRole.CLIENT"
        @click="defaultRole = MeshNodeRole.CLIENT"
      />
      <AppCheckableButton
        icon="i-lucide-circle-x"
        tooltip="CLIENT_MUTE"
        color="secondary"
        :checked="defaultRole == MeshNodeRole.CLIENT_MUTE"
        @click="defaultRole = MeshNodeRole.CLIENT_MUTE"
      />
      <AppCheckableButton
        icon="i-lucide-circle-alert"
        tooltip="ROUTER"
        color="error"
        :checked="defaultRole == MeshNodeRole.ROUTER"
        @click="defaultRole = MeshNodeRole.ROUTER"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MeshNodeRole } from "~/simulator/mesh-node";
import { MeshSimulatorMode } from "~/simulator/mesh-simulator";

const { simulator, logger } = useSimulator();
const { defaultRole } = useSimulatorSettings();

const clearNodes = () => {
  simulator.nodes = [];
  logger.warning("Карта очищена");
};
</script>
