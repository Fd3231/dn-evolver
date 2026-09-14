<template>
<div v-if="validationResult" class="d-flex w-100 mt-1">
  <template v-for="step in maxStep + 1" :key="'icon-' + step">
    <div
      v-if="failedStep === undefined || step <= failedStep"
      class="d-flex justify-content-center"
      :style="{ width: (100 / (maxStep + 1)) + '%' }">

      <div v-if="step === failedStep" class="dropdown">
        <i class="bi bi-exclamation-circle text-danger" style="cursor: pointer;"></i>
        <ul class="dropdown-menu">
          <li
            v-for="(value, key) in validationFlags"
            :key="key"
            class="dropdown-item d-flex align-items-center justify-content-between pe-none small text-secondary">
            <span>{{ FLAG_LABELS[key] ?? key }}</span>
            <i :class="value ? 'bi bi-check-lg text-success' : 'bi bi-x-lg text-danger'"></i>
          </li>
        </ul>
      </div>

      <i v-else class="bi bi-check-lg text-success"></i>
    </div>
  </template>
</div>
</template>

<script setup lang="ts">
  import { useValidation } from '../../composables/plan/useValidation';

  const { FLAG_LABELS, maxStep, validationResult, validationFlags, failedStep } = useValidation();
</script>

<style scoped>  
  .dropdown:hover .dropdown-menu {
    display: block;
    width: 250px;
  }
</style>