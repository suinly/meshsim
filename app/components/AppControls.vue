<template>
  <div>
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

        <UTooltip :delay-duration="0" text="Справка" :content="{ side: 'top' }">
          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-circle-help"
            @click="isHelpOpen = true"
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

    <!-- Модальное окно со справкой -->
    <UModal v-model:open="isHelpOpen" title="Справка по симулятору Mesh-сети">
      <template #content>
        <div class="space-y-4 text-sm p-4">
          <section>
            <h4 class="font-semibold mb-2">Что это за симулятор?</h4>
            <p class="text-gray-600 dark:text-gray-400">
              Интерактивный симулятор mesh-сети, визуализирующий принципы работы
              mesh-networking с реалистичной моделью распространения
              радиосигнала (SNR, path loss, CSMA).
            </p>
          </section>

          <section>
            <h4 class="font-semibold mb-2">Как использовать:</h4>
            <ol
              class="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400"
            >
              <li>
                <strong>Добавление узлов:</strong> нажмите кнопку
                <span class="inline-flex items-center"
                  ><UIcon name="i-lucide-plus" class="w-3 h-3" /></span
                >, выберите тип узла (CLIENT/ROUTER/CLIENT_MUTE), затем кликните
                на карте
              </li>
              <li>
                <strong>Перемещение узлов:</strong> включите режим просмотра
                <span class="inline-flex items-center"
                  ><UIcon name="i-lucide-hand" class="w-3 h-3"
                /></span>
                и перетаскивайте маркеры на карте
              </li>
              <li>
                <strong>Передача пакета:</strong> кликните на узел в любом
                режиме для начала передачи пакета от него
              </li>
              <li>
                <strong>Просмотр логов:</strong> нажмите "Показать панель логов"
                в левом нижнем углу экрана для детальной информации о передаче,
                потерях пакетов и ретрансляциях
              </li>
            </ol>
          </section>

          <section>
            <h4 class="font-semibold mb-2">Типы узлов:</h4>
            <ul class="space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <strong class="text-orange-600 dark:text-orange-400"
                  >CLIENT:</strong
                >
                Задержка ретрансляции зависит от SNR (0-2000 мс). Не
                ретранслирует повторно услышанные пакеты.
              </li>
              <li>
                <strong class="text-blue-600 dark:text-blue-400"
                  >CLIENT_MUTE:</strong
                >
                Только принимает пакеты, никогда не ретранслирует. Используется
                для конечных устройств.
              </li>
              <li>
                <strong class="text-red-600 dark:text-red-400">ROUTER:</strong>
                Мгновенная ретрансляция (0 мс). Не уменьшает hopLimit для
                пакетов от избранных узлов (в разработке).
              </li>
            </ul>
          </section>

          <section>
            <h4 class="font-semibold mb-2">Визуальные эффекты:</h4>
            <ul
              class="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400"
            >
              <li>
                <strong>Передача пакета:</strong> от узла расходится один
                большой круг, визуализирующий распространение радиосигнала
              </li>
              <li>
                <strong>Прием пакета:</strong> вокруг узла появляется небольшой
                круг, быстро исчезающий - индикация успешного приема
              </li>
            </ul>
          </section>

          <section>
            <h4 class="font-semibold mb-2">Особенности симуляции:</h4>
            <ul
              class="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400"
            >
              <li>Максимальная дальность связи: 5 км</li>
              <li>
                SNR-based Reception: вероятность приема зависит от отношения
                сигнал/шум
              </li>
              <li>CSMA: узлы проверяют, не занят ли канал перед передачей</li>
              <li>
                Hop Limiting: пакеты имеют ограничение на количество переходов
                (по умолчанию 3)
              </li>
              <li>
                Duplicate Suppression: узлы подавляют повторную ретрансляцию
                дубликатов
              </li>
            </ul>
          </section>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { NodeRole } from "~/simulator/NodeRole";
import { SimulatorMode } from "~/simulator/SimulatorMode";

const { simulator, logger } = useSimulator();
const { defaultRole } = useSimulatorSettings();

const isHelpOpen = ref(false);

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
