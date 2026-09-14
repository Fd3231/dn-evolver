import { computed, ref } from "vue";
import { usePlanStore } from "../../stores/usePlanStore";

export function usePlanPanel() {

    const planStore = usePlanStore();
    const tabs: string[] = ["Simulation", "Validation"];
    let activeTab = ref("Simulation"); 
    
    const currentStep = computed(() => planStore.currentStep); 
    const hasPlan = computed(() => Object.keys(planStore.steps).length > 0);
    
    return { hasPlan, currentStep, tabs, activeTab };

}