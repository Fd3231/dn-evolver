import { computed, watch } from "vue";
import { useNetworkStore } from "../../stores/useNetworkStore";
import { usePlanStore } from "../../stores/usePlanStore";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { useToast } from "../useToast";
import { useShortcuts } from "../useShortcuts";

export function useStepNavigation() {

    const networkStore = useNetworkStore();
    const planStore = usePlanStore();
    const { showToast } = useToast();

    useShortcuts([
        { key: 'ArrowRight', when: () => currentStep.value < maxStep.value, handler: () => updateStep(currentStep.value + 1) },
        { key: 'ArrowLeft',  when: () => currentStep.value > 0, handler: () => updateStep(currentStep.value - 1) },
    ])

    const currentStep = computed({
        get: () => planStore.currentStep,
        set: (val) => { planStore.currentStep = val },
    });
    const maxStep = computed(() => Object.keys(planStore.steps).length - 1);

    const syncNetwork = () => {
        networkStore.startLines = planStore.steps[currentStep.value].lines;
    };

    const updateStep = (newStepValue: number) => {
        currentStep.value = newStepValue;
    };

    const deleteStep = () => {
        if (currentStep.value === 0) return;
        planStore.deleteStep(currentStep.value);
    };

    const addStep = () => {
        planStore.addStep(currentStep.value);
    };

    const downloadPlan = async () => {
        try {
            const filePath = await save({ defaultPath: 'plan.json' });
            if (filePath) {
                const output = Object.fromEntries(
                    Object.values(planStore.steps)
                        .filter(step => step.actions.length > 0)
                        .map(step => [
                            step.id,
                            step.actions.map(a => ({ action: a.name, params: a.params }))
                        ])
                    );
                await writeTextFile(filePath, JSON.stringify(output, null, 2));
                showToast('Plan downloaded successfully!', 'success');
            }
        } catch (e) {
            showToast('Error downloading the plan.', 'danger');
        }
    }

    watch(
        () => planStore.steps[planStore.currentStep]?.lines,
        (lines) => {
            if (lines) networkStore.startLines = lines;
        },
        { immediate: true, deep: true }
    );

    return { currentStep, maxStep, updateStep, deleteStep, addStep, syncNetwork, downloadPlan };

}