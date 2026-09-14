import { computed, ref } from "vue";
import { useNetworkStore } from "../stores/useNetworkStore";
import { Substation } from "../models/Substation";
import { Line } from "../models/Line";

export function useNetworkPanel() {
    
    const tabs: string[] = ["Substations", "Lines"];
    let activeTab = ref("Substations"); 
    let searchTerm = ref("");

    const networkStore = useNetworkStore();

    const hasNetwork = computed(() => Object.keys(networkStore.substations).length > 0);

    const matchesSearch = <T>(item: T, term: string, getFields: (item: T) => (string | number | null | undefined)[]): boolean => {
        const lower = term.toLowerCase();
        return getFields(item).some(field => 
            field?.toString().toLowerCase().includes(lower)
        );
    };

    const substationFields = (substation: Substation) => [
        substation.id, substation.type
    ];

    const lineFields = (line: Line) => [
        line.id, line.source, line.target, line.status, line.type, line.length
    ];

    const filteredSubstations = () : Substation[] => {
        return Object.values(networkStore.substations).
            filter(t => matchesSearch(t, searchTerm.value.toLocaleLowerCase(), substationFields));
    }

    const filteredLines = () : Line[] => {
        return Object.values(networkStore.startLines).
            filter(t => matchesSearch(t, searchTerm.value.toLocaleLowerCase(), lineFields));
    }
    
    return {networkStore, tabs, activeTab, searchTerm, hasNetwork, filteredSubstations, filteredLines };

}