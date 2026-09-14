import { computed, ref, watch } from "vue";
import { useNetworkStore } from "../../stores/useNetworkStore";
import { usePlanStore } from "../../stores/usePlanStore";
import { ACTION, ActionType, LINE_STATUS } from "../../types";
import { Action } from "../../models/Action";

const EMPTY_ACTION = () => ({
    name: '' as ActionType | '',
    lines: ['', ''] as [string, string],
});

export function useActionBuilder() {
    
    const planStore = usePlanStore();
    const networkStore = useNetworkStore();

    const selectedRows = ref<Set<number>>(new Set());
    const isAdding = ref(false);
    const newAction = ref(EMPTY_ACTION());
    const actionOptions = [ACTION.ADD, ACTION.REMOVE, ACTION.SWITCH];
    const maxActionCost = ref(1_000_000);
    const editing = ref<Action | null>(null);
    const editingCost = ref<number>(0);

    const currentStep = computed(() => planStore.currentStep);
    const currentStepActions = computed(() => planStore.steps[currentStep.value]?.actions ?? []);
    const currentStepCost = computed(() => planStore.stepCost(currentStep.value));
    const buildableLines = computed(() => planStore.availableToBuild);
    const removableLines = computed(() => planStore.availableToRemove);
    const switchableLines = computed(() => planStore.availableToSwitch);
    const availableSteps = computed(() =>
        Object.keys(planStore.steps)
            .map(Number)
            .filter(k => k !== 0 && k !== planStore.currentStep)
    )

    const buildNodeOrder = (edges: [string, string]): string[] => {
        const pairs = edges.map(edge => edge.split('-'));
        const common = pairs[0].find(node => pairs[1].includes(node));
        if (!common) throw new Error(`No common node found between edges: ${edges.join(', ')}`);
        const others = pairs.map(pair => pair.find(node => node !== common)!);
        const firstLinkOpen = networkStore.startLines[edges[0]].status === LINE_STATUS.OPEN;
        return firstLinkOpen
            ? [common, others[0], others[1]]
            : [common, others[1], others[0]];
    };

    const confirmAdd = () => {
        const { name, lines } = newAction.value;
        if (!name) return;
        if ((name === ACTION.ADD || name === ACTION.REMOVE) && !lines[0]) return;
        if (name === ACTION.SWITCH && (!lines[0] || !lines[1])) return;
        
        let params: string[];
        let cost: number;

        if (name === ACTION.ADD || name === ACTION.REMOVE) {
            params = lines[0].split('-');
            cost = name === ACTION.ADD ? planStore.costs.add : planStore.costs.remove;
        } else {
            params = buildNodeOrder(lines);
            cost = planStore.costs.switch;
        }
        planStore.addActionToStep(currentStep.value, new Action(name, params, cost));
        cancelAdd();
    };

    const cancelAdd = () => {
        isAdding.value = false;
        newAction.value = EMPTY_ACTION();
    };

    const removeAction = () => {
        if (selectedRows.value.size === 0) return;
        planStore.removeActionsFromStep(currentStep.value, selectedRows.value);
        selectedRows.value.clear();
    };

    const toggleSelection = (index: number) => {
        selectedRows.value.has(index)
            ? selectedRows.value.delete(index)
            : selectedRows.value.add(index);
    };

    const toggleSelectionAll = () => {
        if (selectedRows.value.size < currentStepActions.value.length) {
            for (let i=0; i<currentStepActions.value.length; i++) {
                if (!selectedRows.value.has(i)) {
                    selectedRows.value.add(i)
                }
            }   
        } else {
            selectedRows.value = new Set()
        }
    }

    const adjacentLines = (line: string) => {
        const l = switchableLines.value[line];
        return l.getAdjacent(switchableLines.value).filter(adj => adj.status !== l.status);
    }

    const moveToStep = (targetStep: number) => {
        planStore.moveActionsToStep(planStore.currentStep, targetStep, selectedRows.value);
        selectedRows.value.clear();
    }

    const formatSwitchAction = (params: string[]) => {
        let res: string[] = [];
        for (const a of params) {
            for (const b of params) {
                if (a === b) continue;
                const key = `${a}-${b}`;
                if (networkStore.startLines[key])
                    res.push(key);
                if (res.length === 2)
                    return res.join(" ");
            }
        }
        return res.join(" ");
    }

    const updateActionCost = (index: number) => {
    const clamped = Math.min(maxActionCost.value, Math.max(0, editingCost.value))
    planStore.updateActionCost(currentStep.value, index, clamped)
    editing.value = null
    }

    const startEditingCost = (action: Action) => {
        editing.value = action
        editingCost.value = action.cost
    }

    watch(currentStep, () => {
        cancelAdd();
    }, { immediate: true });

    return {
        selectedRows, isAdding, newAction, actionOptions,
        currentStepActions, currentStepCost, availableSteps,
        buildableLines, removableLines, switchableLines,
        editing, maxActionCost, editingCost,
        confirmAdd, cancelAdd, removeAction, toggleSelection,
        toggleSelectionAll, adjacentLines, moveToStep, formatSwitchAction,
        updateActionCost, startEditingCost
    };

}