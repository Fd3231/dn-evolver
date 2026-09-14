import { ref, watch } from 'vue';
import { usePlanStore } from '../stores/usePlanStore';
import { useNetworkStore } from '../stores/useNetworkStore';

export function usePanel() {

    const activeTab = ref<'network' | 'plan'>('network')

    const planStore = usePlanStore();
    const networkStore = useNetworkStore();

    watch(() => planStore.initialized, 
        () => {
            activeTab.value = 'plan';
        }
    )

    watch(() => [networkStore.initialized], 
        () => {
            activeTab.value = 'network';
        }
    )

    return { activeTab };
}