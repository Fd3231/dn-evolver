import { defineStore } from "pinia";
import { Line } from "../models/Line";
import { Step } from "../models/Step";
import { Action } from "../models/Action";
import { ACTION, ACTION_COST_KEY, ActionType, CostConfig, LINE_TYPE } from "../types";
import { cloneLines, simulateStep } from "../utils/utils";
import { computed, ref } from "vue";
import { useNetworkStore } from "./useNetworkStore";

export const usePlanStore = defineStore("planStore", () => {
  const steps = ref<Record<number,Step>>({})
  const currentStep = ref<number>(0)
  const costs = ref<CostConfig>({add: 0, remove: 0, switch: 0, fixed: 0})
  const initialized = ref(0);

  const totalCost = computed((): number => {
    return Object.keys(steps.value)
      .reduce((sum, key) => sum + stepCost(Number(key)), 0) + costs.value.fixed;
  })

  const availableToBuild = computed((): Record<string, Line> => {
    const alreadyBuilt = _actionsOfType(ACTION.ADD, steps.value);
    return Object.fromEntries(
      Object.entries(steps.value[0].lines)
        .filter(([key, line]) => line.type === LINE_TYPE.BUILDABLE && !alreadyBuilt.has(key))
    );
  });
  
  const availableToRemove = computed((): Record<string, Line> => {
    const alreadyRemoved = _actionsOfType(ACTION.REMOVE, steps.value);
    const currentLines = steps.value[currentStep.value].lines;
    return Object.fromEntries(
      Object.entries(steps.value[0].lines)
          .filter(([key, line]) => line.type === LINE_TYPE.REMOVABLE && (key in currentLines) && !alreadyRemoved.has(key))
    );
  });

  const availableToSwitch = computed((): Record<string, Line> => {

    const stepsUpToCurrent = Object.fromEntries(
      Object.entries(steps.value).slice(0, currentStep.value+1)
    ) as Record<number, Step>;

    const alreadyRemoved = _actionsOfType(ACTION.REMOVE, stepsUpToCurrent);
    const alreadyBuilt = _actionsOfType(ACTION.ADD, stepsUpToCurrent);

    return Object.fromEntries(
      Object.entries(steps.value[0].lines)
        .filter(([key, line]) => 
          !alreadyRemoved.has(key) &&
          (line.type !== LINE_TYPE.BUILDABLE || alreadyBuilt.has(key)) &&
          steps.value[currentStep.value].lines[key].type !== LINE_TYPE.SWITCHED
        )
    );
  });

  const _actionsOfType = (name: string, steps: Record<number,Step>) => new Set(
    Object.values(steps)
      .flatMap(step =>
      step.actions.filter(a => a.name === name).map(a => a.params.join("-"))
    )
  );

  function stepCost(stepIndex: number): number {
    return steps.value[stepIndex]?.actions.reduce((sum, a) => sum + a.cost, 0) ?? 0
  }

  function initializePlan(newSteps: Record<number, Step>, startLines: Record<string, Line>) {
    let lines = cloneLines(startLines);
    initialized.value+=1;
    newSteps = { 0: new Step(0, [], [], lines), ...newSteps };
    Object.values(newSteps).forEach(
      step => {
        step.lines = lines = simulateStep(lines, step.actions);
        step.cost = step.actions.reduce((sum, a) => sum + a.cost, 0);
      }
    );
    steps.value = newSteps;
  }

  function initializeEmptyPlan() {
    resetPlan();
    let lines = cloneLines(useNetworkStore().originalStartLines);
    initialized.value+=1;
    steps.value = { 0: new Step(0, [], [], lines)}
  }
  
  function updateCosts(newCosts: CostConfig) {
    const oldCosts = costs.value;
    costs.value = { ...newCosts };

    Object.values(steps.value).forEach(step => {
      let stepChanged = false;

      step.actions.forEach(action => {
        const costKey = ACTION_COST_KEY[action.name as ActionType];
        if (costKey && newCosts[costKey] !== oldCosts[costKey]) {
          action.cost = newCosts[costKey];
          stepChanged = true;
        }
      });

      if (stepChanged) {
        step.cost = step.actions.reduce((sum, a) => sum + a.cost, 0);
      }
    });
  }

  function resetCosts() {
    costs.value = {add: 0, remove: 0, switch: 0, fixed: 0};
    Object.values(steps.value).forEach(step => {
    step.actions.forEach(action => {
      const costKey = ACTION_COST_KEY[action.name as ActionType];
      if (costKey) action.cost = costs.value[costKey];
    });
    step.cost = step.actions.reduce((sum, a) => sum + a.cost, 0);
  });
  }

  function deleteStep(step: number) {
    if (step === 0) return;
    for (let i = step; i < Object.keys(steps.value).length - 1; i++) {
      steps.value[i] = { ...steps.value[i + 1], id: i };
    }
    delete steps.value[Object.keys(steps.value).length - 1];
    initializePlan(steps.value, steps.value[0].lines);
    currentStep.value-=1;
  }

  function resetPlan() {
    useNetworkStore().resetStartLines()
    currentStep.value = 0;
    steps.value = {};
    costs.value = {add: 0, remove: 0, switch: 0, fixed: 0};
  }

  function addStep(step: number) {
    const length = Object.keys(steps.value).length;
    const emptyStep = new Step(0,[], steps.value[step].nodes, {});
    for (let i = length; i > step + 1; i--) {
      steps.value[i] = { ...steps.value[i - 1], id: i };
    }
    steps.value[step + 1] = { ...emptyStep, id: step + 1 };
    currentStep.value+=1;
    initializePlan(steps.value, steps.value[0].lines);
  }

  function removeActionsFromStep(stepId: number, actions: Set<number>) {
    if (stepId === 0) return;
    steps.value[stepId].actions = steps.value[stepId].actions.filter((_, i) => !actions.has(i));
    initializePlan(steps.value, steps.value[0].lines);
  }

  function addActionToStep(stepId: number, action: Action) {
    if (stepId === 0) return;
    steps.value[stepId].actions.push(action);
    initializePlan(steps.value, steps.value[0].lines);
  }

  function updateActionCost(stepIndex: number, actionIndex: number, cost: number) {
    steps.value[stepIndex].actions[actionIndex].cost = cost
  }

  function moveActionsToStep(fromStepId: number, toStepId: number, actions: Set<number>) {
    if (fromStepId === 0 || toStepId === 0) return;

    const actionsToMove = steps.value[fromStepId].actions.filter((_, i) => actions.has(i));
    steps.value[fromStepId].actions = steps.value[fromStepId].actions.filter((_, i) => !actions.has(i));
    steps.value[toStepId].actions.push(...actionsToMove);

    initializePlan(steps.value, steps.value[0].lines);
  }

  return { steps, currentStep, costs, initialized, totalCost, availableToBuild, availableToRemove, availableToSwitch,
            initializePlan, updateCosts, deleteStep, resetPlan, addStep,
            removeActionsFromStep, addActionToStep, moveActionsToStep,
            updateActionCost, stepCost, resetCosts, initializeEmptyPlan }

});