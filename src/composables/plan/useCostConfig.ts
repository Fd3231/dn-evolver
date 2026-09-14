import { computed, ref } from "vue";
import { usePlanStore } from "../../stores/usePlanStore";
import { CostConfig } from "../../types";
import { useToast } from "../useToast";
import { formatCurrency } from "../../utils/utils";
import { Dropdown } from "bootstrap";

export function useCostConfig() {

    const planStore = usePlanStore();
    const { showToast } = useToast();
    const minCost = 0;
    const maxCost = 1_000_000;

    const form = ref<CostConfig>({ ...planStore.costs });
    const savedValues = ref<CostConfig>({ ...planStore.costs });
    const totalCost = computed(() => formatCurrency(planStore.totalCost));
    const dropdownToggle = ref<HTMLElement | null>(null);
    const hasPlan = computed(() => Object.keys(planStore.steps).length > 0);

    const isUnchanged = computed(() =>
        (Object.keys(form.value) as Array<keyof CostConfig>).every(
            k => form.value[k] === savedValues.value[k]
        )
    );

    const isValid = computed(() =>
        Object.values(form.value).every(v => v >= minCost && v <= maxCost)
    );

    const save = () => {
        if (!isValid.value) {
            showToast("Invalid cost", 'danger', "bottom-center");
            return;
        }
        savedValues.value = { ...form.value };
        planStore.updateCosts(form.value);
        Dropdown.getInstance(dropdownToggle.value!)?.hide()
    };

    const reset = () => {
        form.value = { add: 0, remove: 0, switch: 0, fixed: 0 };
        planStore.resetCosts();
    }

    return { form, isUnchanged, isValid, totalCost, dropdownToggle, hasPlan, save, reset };

}