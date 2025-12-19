<template>
  <div
    class="mesh-map-wrapper"
    :class="{ 'adding-node-mode': isAddingMode }"
  >
    <LMap
      :zoom="11"
      :center="[59.938784, 30.314997]"
      :use-global-leaflet="false"
      @click="onMapClick"
    >
      <LTileLayer
        :url="tileLayerUrl"
        attribution="&amp;copy; <a href=&quot;https://carto.com/attributions&quot;>CARTO</a>"
      />

      <slot />
    </LMap>
  </div>
</template>

<script setup lang="ts">
import type { LeafletMouseEvent } from 'leaflet'

defineProps<{
  isAddingMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', lat: number, lng: number): void
}>()

const colorMode = useColorMode()

const tileLayerUrl = computed(() => {
  return colorMode.value === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
})

const onMapClick = (event: LeafletMouseEvent) => {
  const { lat, lng } = event.latlng
  emit('click', lat, lng)
}
</script>

<style>
.mesh-map-wrapper {
  width: 100%;
  height: 100%;
}

.leaflet-attribution-flag {
  display: none !important;
}

.leaflet-marker-icon {
  background: transparent !important;
  border: none !important;
}

/* Курсор в режиме добавления ноды - глобальные стили для перекрытия Leaflet */
.mesh-map-wrapper.adding-node-mode .leaflet-container {
  cursor: crosshair !important;
}

.mesh-map-wrapper.adding-node-mode .leaflet-container * {
  cursor: crosshair !important;
}

/* Перекрываем все возможные классы курсора Leaflet */
.mesh-map-wrapper.adding-node-mode .leaflet-grab,
.mesh-map-wrapper.adding-node-mode .leaflet-dragging,
.mesh-map-wrapper.adding-node-mode .leaflet-clickable,
.mesh-map-wrapper.adding-node-mode .leaflet-interactive {
  cursor: crosshair !important;
}
</style>
