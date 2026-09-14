<template>
  <div class="d-flex w-100 align-items-center justify-content-center flex-shrink-0 resize-handle">
    <div class="handle-grip" ></div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
  .resize-handle {
    height: 3px;
    cursor: ns-resize;

  }
  .resize-handle:hover, .resize-handle:active {
    background: var(--bs-border-color);
    transition: background 0.15s;
  }
</style>