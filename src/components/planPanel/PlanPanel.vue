<template>
    <div  v-if="hasPlan"  class="mt-3 tabs d-flex align-items-center flex-wrap">
        <CostConfigForm />
        <button v-if="!validationResult" class="btn btn-success ms-auto ps-4 pe-4" :disabled="isValidating" @click="validate">
            <span>Validate</span>
            <span v-if="isValidating" class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
        </button>
        <button v-else class="btn btn-danger ms-auto ps-4 pe-4" @click="clearValidation">Clear</button>
    </div>
    <div v-if="hasPlan" class="d-flex flex-column" style="min-height: 0">
        <StepNavigator/>
        <ActionTable v-if="currentStep > 0"/>   
    </div>
</template>

<script setup lang="ts">
    import { usePlanPanel } from "../../composables/plan/usePlanPanel";
    import { useValidation } from "../../composables/plan/useValidation";
    import ActionTable from "./ActionTable.vue";
    import CostConfigForm from "./CostConfigForm.vue";
    import StepNavigator from "./StepNavigator.vue";

    const { hasPlan, currentStep, tabs, activeTab } = usePlanPanel();
    const { validationResult, isValidating, validate, clearValidation } = useValidation();
</script>

<style scoped>
</style>