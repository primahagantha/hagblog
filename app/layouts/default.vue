<template>
  <div class="app-layout">
    <LayoutTheNavbar />
    <main class="main-content">
      <slot />
    </main>
    <LayoutTheFooter />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}
</style>
