<script setup>
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'ru'
  },
  script: [
    {
      children: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(105731036,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`,
      type: 'text/javascript'
    }
  ],
  noscript: [
    {
      children: '<div><img src="https://mc.yandex.ru/watch/105731036" style="position:absolute; left:-9999px;" alt="" /></div>'
    }
  ]
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
