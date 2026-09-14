import { ref, computed } from "vue";
import { useNetworkStore } from "../../stores/useNetworkStore";
import { MapType } from "./useNetworkMapData";

export function useNetworkMapUI(map: MapType) {
  const networkStore = useNetworkStore();
  const isFullscreen = ref(false);
  const isHighlighted = ref(false);
  const isMenuExpanded = ref(true);

  const hasNetwork = computed(() => Object.keys(networkStore.substations).length > 0);
  const expandMenu = () => { isMenuExpanded.value = !isMenuExpanded.value; };

  const getEdges = () => {
    if (map === "start") {
      return isHighlighted.value ? networkStore.getHighlightedLines() : networkStore.getDefaultLines();
    }
    return networkStore.targetLines;
  };

  return { networkStore, isFullscreen, isHighlighted, isMenuExpanded, hasNetwork, expandMenu, getEdges };
}