<template>
  <div v-if="lastPacketId > 0">
    <p>Пакет #{{ lastPacketId }}</p>
    <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
      Приняло узлов: {{ receivedNodes.length }}/{{
        simulator.nodes.length - 1
      }}
      ({{
        ((receivedNodes.length / (simulator.nodes.length - 1)) * 100).toFixed(
          2,
        )
      }}%)
    </p>
  </div>
</template>

<script setup lang="ts">
const { simulator } = useSimulator();

const lastPacketId = computed(() => {
  return simulator.packetCount;
});

const receivedNodes = computed(() => {
  return simulator.nodes.filter((node) =>
    node.receivedPackets.find(
      (packet) =>
        packet.id === lastPacketId.value && packet.sourceId !== node.id,
    ),
  );
});
</script>
