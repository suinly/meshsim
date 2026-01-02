import type { BaseNode } from "~/simulator/BaseNode";

interface SpiderOffset {
  x: number; // Смещение в пикселях по X
  y: number; // Смещение в пикселях по Y
}

// Глобальное состояние для spider-эффекта
const expandedGroups = ref<Set<string>>(new Set());
const spiderOffsets = ref<Map<number, SpiderOffset>>(new Map());

export const useNodeSpider = () => {
  const { simulator } = useSimulator();

  // Получить ключ группы для узла
  function getGroupKey(node: BaseNode): string {
    return `${node.lat.toFixed(5)}_${node.lng.toFixed(5)}`;
  }

  // Проверить, является ли узел частью группы
  function isInGroup(node: BaseNode): boolean {
    const groups = simulator.getNodeGroups();

    for (const [groupKey, nodes] of groups.entries()) {
      if (nodes.some((n) => n.id === node.id)) {
        return true;
      }
    }

    return false;
  }

  // Получить количество узлов в группе
  function getGroupSize(node: BaseNode): number {
    const groups = simulator.getNodeGroups();

    for (const [groupKey, nodes] of groups.entries()) {
      if (nodes.some((n) => n.id === node.id)) {
        return nodes.length;
      }
    }

    return 1;
  }

  // Получить группу, содержащую узел
  function getNodeGroup(node: BaseNode): BaseNode[] | null {
    const groups = simulator.getNodeGroups();

    for (const [groupKey, nodes] of groups.entries()) {
      if (nodes.some((n) => n.id === node.id)) {
        return nodes;
      }
    }

    return null;
  }

  // Проверить, развернута ли группа
  function isGroupExpanded(node: BaseNode): boolean {
    const key = getGroupKey(node);
    return expandedGroups.value.has(key);
  }

  // Вычислить визуальные смещения для узлов в группе (кольцами вокруг центра)
  function calculateSpiderOffsets(
    nodes: BaseNode[],
  ): Map<number, SpiderOffset> {
    const offsets = new Map<number, SpiderOffset>();

    // Параметры
    const spacing = 31; // Расстояние между узлами (размер узла 30px + 1px зазора)

    let nodeIndex = 0;

    // Первый узел в центре
    if (nodes[0]) {
      offsets.set(nodes[0].id, { x: 0, y: 0 });
      nodeIndex++;
    }

    // Размещаем остальные узлы кольцами вокруг центра
    let ring = 1;
    while (nodeIndex < nodes.length) {
      // Количество узлов в этом кольце (6 * ring для гексагональной упаковки)
      const nodesInRing = 6 * ring;
      const radius = ring * spacing;

      // Размещаем узлы равномерно по кругу
      for (let i = 0; i < nodesInRing; i++) {
        if (nodeIndex >= nodes.length) break;

        const node = nodes[nodeIndex];
        if (node) {
          // Угол для текущего узла (начинаем справа, идем против часовой стрелки)
          const angle = (i / nodesInRing) * 2 * Math.PI;

          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          offsets.set(node.id, { x, y });
        }

        nodeIndex++;
      }

      ring++;
    }

    return offsets;
  }

  // Развернуть группу
  function expandGroup(node: BaseNode): boolean {
    const targetGroup = getNodeGroup(node);
    if (!targetGroup || targetGroup.length <= 1) return false;

    const key = getGroupKey(node);
    expandedGroups.value.add(key);

    // Вычисляем визуальные смещения
    const offsets = calculateSpiderOffsets(targetGroup);

    // Используем батчинг для обновления всех смещений сразу
    // Это предотвращает множественные реактивные пересчеты
    const newOffsets = new Map(spiderOffsets.value);
    offsets.forEach((offset, nodeId) => {
      newOffsets.set(nodeId, offset);
    });
    spiderOffsets.value = newOffsets;

    return true;
  }

  // Свернуть группу
  function collapseGroup(node: BaseNode): boolean {
    const targetGroup = getNodeGroup(node);
    if (!targetGroup) return false;

    const key = getGroupKey(node);
    expandedGroups.value.delete(key);

    // Удаляем смещения батчем
    const newOffsets = new Map(spiderOffsets.value);
    targetGroup.forEach((n) => {
      newOffsets.delete(n.id);
    });
    spiderOffsets.value = newOffsets;

    return true;
  }

  // Переключить состояние группы (развернуть/свернуть)
  function toggleGroup(node: BaseNode): boolean {
    if (isGroupExpanded(node)) {
      return collapseGroup(node);
    } else {
      return expandGroup(node);
    }
  }

  // Свернуть все группы
  function collapseAll() {
    expandedGroups.value.clear();
    spiderOffsets.value = new Map(); // Создаем новую Map вместо clear()
  }

  // Получить визуальное смещение для узла
  function getSpiderOffset(node: BaseNode): SpiderOffset | null {
    return spiderOffsets.value.get(node.id) || null;
  }

  // Получить развернутую группу узлов (если есть)
  function getExpandedGroup(): BaseNode[] | null {
    if (expandedGroups.value.size === 0) return null;

    const groups = simulator.getNodeGroups();
    for (const [groupKey, nodes] of groups.entries()) {
      if (expandedGroups.value.has(groupKey)) {
        return nodes;
      }
    }

    return null;
  }

  // Проверить, является ли узел частью развернутой группы
  function isNodeInExpandedGroup(node: BaseNode): boolean {
    const expandedGroup = getExpandedGroup();
    if (!expandedGroup) return false;

    return expandedGroup.some((n) => n.id === node.id);
  }

  return {
    isInGroup,
    getGroupSize,
    getNodeGroup,
    isGroupExpanded,
    expandGroup,
    collapseGroup,
    toggleGroup,
    collapseAll,
    getSpiderOffset,
    getExpandedGroup,
    isNodeInExpandedGroup,
  };
};
