<template>
    <div class="d-flex align-items-start mt-3 w-100 gap-2 mb-1">
        <div class="d-flex w-100 flex-column validation-container">
            <div class="d-flex w-100 progress-container">
                <div
                    v-for="step in maxStep + 1"
                    :key="step"
                    class="text-white text-center small me-1 pt-1"
                    :class="step - 1 === currentStep ? 'bg-primary' : 'bg-secondary'"
                    :style="{ width: (100 / (maxStep + 1)) + '%'}"
                    @click="updateStep(step - 1)">
                    {{ step - 1 }}
                </div>
            </div>
            <Validation />
        </div>
        <button class="btn btn-light btn-sm" :disabled="currentStep <= 0" @click="updateStep(currentStep - 1)">
            <i class="bi bi-caret-left-fill"></i>
        </button>
        <button class="btn btn-light btn-sm" :disabled="currentStep >= maxStep" @click="updateStep(currentStep + 1)">
            <i class="bi bi-caret-right-fill"></i>
        </button>
        <button class="btn btn-light btn-sm" @click="addStep">
            <i class="bi bi-plus-lg"></i>
        </button>
        <button class="btn btn-light btn-sm" :disabled="currentStep === 0" @click="deleteStep">
            <i class="bi bi-trash-fill"></i>
        </button>
        <button class="btn btn-light btn-sm">
            <i class="bi bi-download" @click="downloadPlan"></i>
        </button>
    </div>
</template>

<script setup lang="ts">
    import { useStepNavigation } from '../../composables/plan/useStepNavigation';
    import Validation from './Validation.vue';
    
    const { currentStep, maxStep, updateStep, deleteStep, addStep, downloadPlan } = useStepNavigation();
</script>

<style scoped>
    .progress { height: 1.9rem; gap: 0.14rem; cursor: pointer; }

    .validation-container {
        background-color: transparent;
        align-self: center;
        margin-top: 1px;
    }
    .small {
        font-size: smaller;
        cursor: pointer;
    }
    .progress-container {
        height: 1.9rem;
    }
</style>