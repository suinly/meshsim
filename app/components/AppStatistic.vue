<template>
  <div v-if="lastPacketId > 0">
    <p>Пакет #{{ lastPacketId }}</p>
    <div class="mt-3 text-sm text-gray-600 dark:text-gray-400">
      <p>Приняло узлов: {{ receivedNodesCount }}/{{ totalNodesCount }}</p>
      <p>Покрытие: {{ percentOfReceived.toFixed(2) }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { simulator } = useSimulator();

const lastPacketId = computed(() => {
  return simulator.packetCount;
});

const totalNodesCount = computed(() => {
  return simulator.nodes.length - 1;
});

const receivedNodesCount = computed(() => {
  return (
    simulator.nodes.filter((node) =>
      node.receivedPackets.find(
        (packet) =>
          packet.id === lastPacketId.value && packet.sourceId !== node.id,
      ),
    ).length || 0
  );
});

const percentOfReceived = computed(() => {
  return (receivedNodesCount.value / totalNodesCount.value) * 100;
});
</script>
