import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useValidationStore } from "../../stores/useValidationStore";
import { Step } from "../../models/Step";
import { ValidationResult } from "../../types";


describe('useValidationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has correct initial state', () => {
    const store = useValidationStore()
    expect(store.instanceData).toBeNull()
    expect(store.planData).toEqual({})
    expect(store.loading).toBe(false)
    expect(store.result).toBeNull()
    expect(store.error).toBeNull()
    expect(store.validationResult).toBeNull()
  })

  it('loadInstanceData sets instanceData', () => {
    const store = useValidationStore()
    const data = { id: 1, name: 'test' }
    store.loadInstanceData(data)
    expect(store.instanceData).toEqual(data)
  })

  it('loadPlanData sets planData', () => {
    const store = useValidationStore()
    const data: Record<number, Step> = {
      0: new Step(0,[]),
    }
    store.loadPlanData(data)
    expect(store.planData).toEqual(data)
  })

    it('setValidationResult sets validationResult', () => {
    const store = useValidationStore()
    const vr: ValidationResult = {
        Efault: true,
        'Efault+': true,
        Pfault: true,
        'Pfault+': true,
        degree: true,
        rad: true,
        target_reached: true
    }
    store.setValidationResult(vr)
    expect(store.validationResult).toEqual(vr)
    })
})