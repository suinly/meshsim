// Управление z-index для плавающих окон
const baseZIndex = 9999;
let topZIndex = baseZIndex;

export function useWindowStack() {
  const zIndex = ref(baseZIndex);

  function bringToFront() {
    topZIndex += 1;
    zIndex.value = topZIndex;
  }

  return {
    zIndex,
    bringToFront,
  };
}
