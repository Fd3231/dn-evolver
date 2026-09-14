import { defineStore } from "pinia";
import { Step } from "../models/Step";
import { ValidationResult } from "../types";
import { ref } from "vue";

export const useValidationStore = defineStore('validationStore', () => {
  const instanceData = ref<any>(null)
  const planData = ref<Record<number, Step>>({})
  const loading = ref(false)
  const result = ref<any>(null)
  const error = ref<string | null>(null)
  const validationResult = ref<ValidationResult | null>(null)

  function loadInstanceData(data: any) {
    instanceData.value = data
  }

  function loadPlanData(data: Record<number, Step>) {
    planData.value = data
  }

  function setValidationResult(vr: ValidationResult) {
    validationResult.value = vr
  }

  return { instanceData, planData, loading,
            result, error, validationResult, 
              loadInstanceData, loadPlanData, setValidationResult }
})