import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useNetworkStore } from "../../stores/useNetworkStore";
import { Line } from "../../models/Line";
import { ACTION, CostConfig, LINE_STATUS, LINE_TYPE } from "../../types";
import { Action } from "../../models/Action";
import { Step } from "../../models/Step";
import { usePlanStore } from "../../stores/usePlanStore";

const makeLine = (source: string, target: string, type = '', length: number) =>
  new Line(source, target, LINE_STATUS.OPEN, type, length as any)

const makeStep = (id: number, actions: Action[] = [], nodes: any[] = []) =>
  new Step(id, actions, nodes, {})

const makeAction = (name: string, params: string[], cost = 0) =>
  new Action(name, params, cost)

const switchableLine = makeLine('A', 'B', '', 1)
const buildableLine = makeLine('X', 'Y', LINE_TYPE.BUILDABLE, 1)
const removableLine = makeLine('C', 'D', LINE_TYPE.REMOVABLE, 1)

const baseLines = {
  'A-B': makeLine('A', 'B', '', 1),
  'C-D': makeLine('C', 'D', '', 1),
  'X-Y': buildableLine,
}

const planLines = {
  'A-B': switchableLine,
  'X-Y': buildableLine,
  'C-D': removableLine,
}

describe('usePlanStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('has correct initial state', () => {
        const store = usePlanStore()
        expect(store.steps).toEqual({})
        expect(store.currentStep).toBe(0)
        expect(store.costs).toEqual({ add: 0, remove: 0, switch: 0, fixed: 0 })
        expect(store.initialized).toBe(0)
    })

    describe('initializePlan', () => {
        it('sets initialized to true', () => {
            const store = usePlanStore()
            store.initializePlan({}, baseLines)
            expect(store.initialized).toBe(1)
        })

        it('always creates step 0', () => {
            const store = usePlanStore()
            store.initializePlan({}, baseLines)
            expect(store.steps[0]).toBeDefined()
            expect(store.steps[0].id).toBe(0)
        })

        it('computes step lines via simulateStep', () => {
            const store = usePlanStore()
            const action = makeAction(ACTION.ADD, ['X', 'Y'])
            store.initializePlan({ 1: makeStep(1, [action]) }, baseLines)
            expect(store.steps[1].lines['X-Y']).toBeDefined()
        })

        it('computes step cost from actions', () => {
            const store = usePlanStore()
            const action = makeAction(ACTION.ADD, ['X', 'Y'], 10)
            store.initializePlan({ 1: makeStep(1, [action]) }, baseLines)
            expect(store.steps[1].cost).toBe(10)
        })

    })

    describe('totalCost', () => {
        it('sums step costs and fixed cost', () => {
            const store = usePlanStore()
            store.costs = { add: 0, remove: 0, switch: 0, fixed: 5 }
            const action = makeAction(ACTION.ADD, ['X', 'Y'], 10)
            store.initializePlan({ 1: makeStep(1, [action]) }, baseLines)
            expect(store.totalCost).toBe(15)
        })
    })

    describe('updateCosts', () => {
        it('updates costs and recalculates step costs', () => {
            const store = usePlanStore()
            const action = makeAction(ACTION.ADD, ['X', 'Y'], 0)
            store.initializePlan({ 1: makeStep(1, [action]) }, baseLines)

            const newCosts: CostConfig = { add: 20, remove: 10, switch: 5, fixed: 0 }
            store.updateCosts(newCosts)

            expect(store.costs).toEqual(newCosts)
            expect(store.steps[1].actions[0].cost).toBe(20)
            expect(store.steps[1].cost).toBe(20)
        })

        it('ignores actions with no matching cost key', () => {
            const store = usePlanStore()
            const action = makeAction('UNKNOWN' as any, ['A', 'B'], 99)
            store.initializePlan({ 1: makeStep(1, [action]) }, baseLines)

            store.updateCosts({ add: 20, remove: 10, switch: 5, fixed: 0 })

            expect(store.steps[1].actions[0].cost).toBe(99)
        })
    })

    describe('addStep', () => {
        it('inserts an empty step after the given step', () => {
            const store = usePlanStore()
            store.initializePlan({ 1: makeStep(1) }, baseLines)
            const lengthBefore = Object.keys(store.steps).length

            store.addStep(0)
            expect(Object.keys(store.steps).length).toBe(lengthBefore + 1)
        })

        it('increments currentStep', () => {
            const store = usePlanStore()
            store.initializePlan({ 1: makeStep(1) }, baseLines)
            store.addStep(0)
            expect(store.currentStep).toBe(1)
        })
    })

    describe('deleteStep', () => {
        it('does nothing when deleting step 0', () => {
            const store = usePlanStore()
            store.initializePlan({ 1: makeStep(1) }, baseLines)
            const before = Object.keys(store.steps).length
            store.deleteStep(0)
            expect(Object.keys(store.steps).length).toBe(before)
        })

        it('removes a step and decrements currentStep', () => {
            const store = usePlanStore()
            store.initializePlan({ 1: makeStep(1), 2: makeStep(2) }, baseLines)
            store.currentStep = 2
            store.deleteStep(1)
            expect(Object.keys(store.steps).length).toBe(2) // 0 and 1 remain
            expect(store.currentStep).toBe(1)
        })
    })
    
    describe('addActionToStep', () => {
        it('does nothing when stepId is 0', () => {
            const store = usePlanStore()
            store.initializePlan({}, baseLines)
            store.addActionToStep(0, makeAction(ACTION.ADD, ['X', 'Y']))
            expect(store.steps[0].actions).toHaveLength(0)
        })

        it('adds action to the given step', () => {
            const store = usePlanStore()
            store.initializePlan({ 1: makeStep(1) }, baseLines)
            store.addActionToStep(1, makeAction(ACTION.ADD, ['X', 'Y']))
            expect(store.steps[1].actions).toHaveLength(1)
        })
    })

    describe('removeActionsFromStep', () => {
        it('does nothing when stepId is 0', () => {
            const store = usePlanStore()
            store.initializePlan({}, baseLines)
            store.removeActionsFromStep(0, new Set([0]))
            expect(store.steps[0].actions).toHaveLength(0)
        })

        it('removes actions at given indices', () => {
            const store = usePlanStore()
            const step = makeStep(1, [
                makeAction(ACTION.ADD, ['X', 'Y']),
                makeAction(ACTION.REMOVE, ['A', 'B']),
            ])
            store.initializePlan({ 1: step }, baseLines)
            store.removeActionsFromStep(1, new Set([0]))
            expect(store.steps[1].actions).toHaveLength(1)
            expect(store.steps[1].actions[0].name).toBe(ACTION.REMOVE)
        })
    })

    describe('moveActionsToStep', () => {
        it('does nothing when fromStep or toStep is 0', () => {
            const store = usePlanStore()
            store.initializePlan({ 1: makeStep(1, [makeAction(ACTION.ADD, ['X', 'Y'])]) }, baseLines)
            store.moveActionsToStep(0, 1, new Set([0]))
            expect(store.steps[1].actions).toHaveLength(1) // unchanged
        })

        it('moves actions between steps', () => {
            const store = usePlanStore()
            store.initializePlan({
                1: makeStep(1, [makeAction(ACTION.ADD, ['X', 'Y'])]),
                2: makeStep(2),
            }, baseLines)
            store.moveActionsToStep(1, 2, new Set([0]))
            expect(store.steps[1].actions).toHaveLength(0)
            expect(store.steps[2].actions).toHaveLength(1)
        })
    })

    describe('resetPlan', () => {
        it('resets all state and calls networkStore.resetStartLines', () => {
            const store = usePlanStore()
            const networkStore = useNetworkStore()
            vi.spyOn(networkStore, 'resetStartLines')

            store.initializePlan({ 1: makeStep(1) }, baseLines)
            store.currentStep = 1
            store.resetPlan()

            expect(store.currentStep).toBe(0)
            expect(store.steps).toEqual({})
            expect(store.costs).toEqual({ add: 0, remove: 0, switch: 0, fixed: 0 })
            expect(networkStore.resetStartLines).toHaveBeenCalled()
        })
    })

    describe('availableToBuild', () => {
        it('returns buildable lines not yet added', () => {
            const store = usePlanStore()
            store.initializePlan({}, planLines)
            expect(store.availableToBuild['X-Y']).toBeDefined()
        })

        it('excludes lines already added by an ADD action', () => {
            const store = usePlanStore()
            store.initializePlan({
            1: makeStep(1, [makeAction(ACTION.ADD, ['X', 'Y'])]),
            }, planLines)
            expect(store.availableToBuild['X-Y']).toBeUndefined()
        })
    })

    describe('availableToRemove', () => {
        it('returns removable lines not yet removed', () => {
            const store = usePlanStore()
            store.initializePlan({}, planLines)
            expect(store.availableToRemove['C-D']).toBeDefined()
        })

        it('excludes lines already removed by a REMOVE action', () => {
            const store = usePlanStore()
            store.initializePlan({
            1: makeStep(1, [makeAction(ACTION.REMOVE, ['C', 'D'])]),
            }, planLines)
            store.currentStep = 1
            expect(store.availableToRemove['C-D']).toBeUndefined()
        })
    })

    describe('availableToSwitch', () => {
        it('returns switchable lines at current step', () => {
            const store = usePlanStore()
            store.initializePlan({}, planLines)
            expect(store.availableToSwitch['A-B']).toBeDefined()
        })

        it('excludes already switched lines', () => {
            const store = usePlanStore()
            store.initializePlan({
            1: makeStep(1, [makeAction(ACTION.SWITCH, ['A', 'B', 'C'])]),
            }, planLines)
            store.currentStep = 1
            expect(store.availableToSwitch['A-B']).toBeUndefined()
        })

        it('excludes buildable lines not yet built', () => {
            const store = usePlanStore()
            store.initializePlan({}, planLines)
            expect(store.availableToSwitch['X-Y']).toBeUndefined()
        })

        it('includes buildable lines that have been added', () => {
            const store = usePlanStore()
            store.initializePlan({
            1: makeStep(1, [makeAction(ACTION.ADD, ['X', 'Y'])]),
            }, planLines)
            store.currentStep = 1
            expect(store.availableToSwitch['X-Y']).toBeDefined()
        })

        it('excludes removed lines', () => {
            const store = usePlanStore()
            store.initializePlan({
            1: makeStep(1, [makeAction(ACTION.REMOVE, ['C', 'D'])]),
            }, planLines)
            store.currentStep = 1
            expect(store.availableToSwitch['C-D']).toBeUndefined()
        })
    })

    describe('initializeEmptyPlan', () => {
        it('increments initialized on each call', () => {
            const store = usePlanStore()
            store.initializeEmptyPlan()
            store.initializeEmptyPlan()
            expect(store.initialized).toBe(2)
        })
        it('creates only step 0', () => {
            const store = usePlanStore()
            store.initializeEmptyPlan()
            expect(Object.keys(store.steps)).toEqual(['0'])
            expect(store.steps[0].id).toBe(0)
            expect(store.steps[0].actions).toEqual([])
        })
        it('resets previously existing steps', () => {
            const store = usePlanStore()
            const action = makeAction(ACTION.ADD, ['X', 'Y'])
            store.initializePlan({ 1: makeStep(1, [action]) }, baseLines)
            store.initializeEmptyPlan()
            expect(Object.keys(store.steps)).toEqual(['0'])
        })
    })

    describe('resetCosts', () => {
        it('resets costs to zero', () => {
            const store = usePlanStore()
            store.costs = { add: 5, remove: 3, switch: 2, fixed: 1 }
            store.resetCosts()
            expect(store.costs).toEqual({ add: 0, remove: 0, switch: 0, fixed: 0 })
        })
        it('resets costs for actions with a mapped cost key', () => {
            const store = usePlanStore()
            const action = makeAction(ACTION.ADD, ['X', 'Y'], 10)
            store.steps = { 1: makeStep(1, [action]) }
            store.resetCosts()
            expect(action.cost).toBe(0)
        })
        it('recomputes step cost', () => {
            const store = usePlanStore()
            const add = makeAction(ACTION.ADD, ['X', 'Y'], 10)
            const remove = makeAction(ACTION.REMOVE, ['Y', 'Z'], 5)
            store.steps = { 1: makeStep(1, [add, remove]) }
            store.resetCosts()
            expect(store.steps[1].cost).toBe(0)
        })
        it('sets step cost to 0 for steps with no actions', () => {
            const store = usePlanStore()
            store.steps = { 0: makeStep(0, []) }
            store.resetCosts()
            expect(store.steps[0].cost).toBe(0)
        })
    })

    describe('updateActionCost', () => {
        it('updates the cost of the specified action', () => {
            const store = usePlanStore()
            const action = makeAction(ACTION.ADD, ['X', 'Y'], 10)
            store.steps = { 1: makeStep(1, [action]) }
            store.updateActionCost(1, 0, 25)
            expect(store.steps[1].actions[0].cost).toBe(25)
        })

        it('only affects the targeted action, not others in the same step', () => {
            const store = usePlanStore()
            const add = makeAction(ACTION.ADD, ['X', 'Y'], 10)
            const remove = makeAction(ACTION.REMOVE, ['Y', 'Z'], 5)
            store.steps = { 1: makeStep(1, [add, remove]) }
            store.updateActionCost(1, 1, 99)
            expect(store.steps[1].actions[0].cost).toBe(10)
            expect(store.steps[1].actions[1].cost).toBe(99)
        })

        it('does not recompute step cost', () => {
            const store = usePlanStore()
            const action = makeAction(ACTION.ADD, ['X', 'Y'], 10)
            const step = makeStep(1, [action])
            step.cost = 10
            store.steps = { 1: step }
            store.updateActionCost(1, 0, 50)
            expect(store.steps[1].cost).toBe(10)
        })
    })

})