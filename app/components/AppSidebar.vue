<template>
  <div class="fixed z-999 h-screen overflow-y-auto p-4 w-[320px] top-0 right-0">
    <div
      class="h-full flex flex-col gap-4 rounded-lg overflow-hidden bg-elevated/50 divide-y divide-default w-full p-4"
    >
      <div class="flex items-center justify-between">
        <AppLogo />

        <div class="flex">
          <UColorModeButton />

          <UButton
            to="https://github.com/suinly/meshsim"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
            color="neutral"
            variant="ghost"
          />
        </div>
      </div>
      <AppControls />
      <AppSettings />
      <MeshLogViewer class="flex-1" />
    </div>
  </div>
</template>
