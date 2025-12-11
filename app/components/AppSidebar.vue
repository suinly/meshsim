<template>
  <div>
    <div
      class="flex flex-col gap-4 rounded-lg overflow-hidden bg-elevated/50 w-full p-4"
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
    </div>
  </div>
</template>
