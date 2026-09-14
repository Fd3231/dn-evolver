import { defineStore } from "pinia";
import { Substation } from "../models/Substation";
import { Line } from "../models/Line";
import { ref } from "vue";
import { LINE_TYPE } from "../types";

export const useNetworkStore = defineStore("networkStore", () => {
  const substations = ref<Record<string,Substation>>({})
  const startLines = ref<Record<string,Line>>({})
  const originalStartLines = ref<Record<string,Line>>({})
  const targetLines = ref<Record<string,Line>>({})
  const initialized = ref(0)

  function initializeNetwork(newSubstations: Record<string, Substation>, newStartLines: Record<string, Line>, newTargetLines: Record<string, Line>) {
    substations.value = newSubstations;
    startLines.value = newStartLines;
    originalStartLines.value = newStartLines;
    targetLines.value = newTargetLines;
    initialized.value = 0;
  }

  function getDefaultLines() {
    return Object.fromEntries(
      Object.entries(startLines.value)
        .filter(([_, line]) => line.type !== LINE_TYPE.BUILDABLE && line.type !== LINE_TYPE.REMOVED)
        .map(([k, line]) => [k, line.type === LINE_TYPE.ADDED || line.type == LINE_TYPE.SWITCHED ? new Line(line.source, line.target, line.status, "", line.length, line.path) : line])
    );
  }

  function getHighlightedLines() {
    return Object.fromEntries(
      Object.entries(startLines.value).filter(([_, line]) => line.type !== LINE_TYPE.BUILDABLE)
    );
  }

  function resetStartLines() {
    startLines.value = originalStartLines.value;
  }
  
  return { substations, startLines, targetLines, initialized, originalStartLines,
            initializeNetwork, getDefaultLines, getHighlightedLines, resetStartLines }

});