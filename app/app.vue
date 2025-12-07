<script setup>
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'ru'
  }
})

const title = 'Симулятор Mesh-сети'

useSeoMeta({
  title,
  ogTitle: title
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
