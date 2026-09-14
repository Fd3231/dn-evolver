import { useValidationStore } from "../../stores/useValidationStore";
import { usePlanStore } from "../../stores/usePlanStore";
import { invoke } from "@tauri-apps/api/core";
import { useToast } from "../useToast";
import { computed, ref } from "vue";

export const useValidation = () => {
    
    const planStore = usePlanStore();
    const validationStore = useValidationStore();
    const { showToast } = useToast();
 
    const FLAG_LABELS: Record<string, string> = {
        Efault: 'Edge fault',
        'Efault+': 'Edge Fault (Strong)',
        Pfault: 'Primary Fault',
        'Pfault+': 'Primary Fault (Strong)',
        degree: 'Degree',
        rad: 'Radiality',
        target_reached: 'Target Reached',
    };
    const isValidating = ref(false);

    const maxStep = computed(() => Object.keys(planStore.steps).length - 1);
    const validationResult = computed(() => validationStore.validationResult);
    const validationFlags = computed(() => {
    if (!validationResult.value) return {};
    const { step, last_action, ...flags } = validationResult.value;
    return flags;
    });
    const hasErrors = computed(() => {
        if (!validationResult.value) return false;
        return Object.values(validationFlags.value).some(v => !v);
    });

    const failedStep = computed(() => {
        if (!validationResult.value || !validationResult.value.step) return undefined;
        return validationResult.value.step + 1 ;
    });

    const validate = async () => {
        isValidating.value = true;
        validationStore.loadPlanData(planStore.steps);
        if (!validationStore.instanceData)
            showToast("Missing instance", 'danger', "bottom-center");
        if (!validationStore.planData)
            showToast("Missing plan", 'danger', "bottom-center");
        try {
            const result = await invoke<any>("run_validator", {
                payload: {
                    instance: validationStore.instanceData,
                    plan: validationStore.planData,
                }
            });
            if (result) {
                validationStore.setValidationResult(result);
            }
        } catch(error: any) {
            showToast(error, 'danger', "bottom-center");
        } finally {
            isValidating.value = false;
        }
    }

    const clearValidation = () => {
        validationStore.validationResult = null;
    }

    const isFailedStep = (step: number) => {
        return hasErrors.value && validationResult.value?.step == step;
    };

    return { FLAG_LABELS, isValidating, validationResult, 
                maxStep, validationFlags, hasErrors, failedStep, 
                    isFailedStep, validate, clearValidation };

}