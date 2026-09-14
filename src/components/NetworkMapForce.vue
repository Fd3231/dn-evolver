<template>
  <div class="container-full mt-2 p-0">
      <div :class="['map', isFullscreen ? 'map-fullscreen' : 'map-normal shadow-sm rounded-3']">
        <svg ref="mapContainer" class="w-100 h-100"></svg>
        <div v-if="hasNetwork" class="bg-white position-absolute bottom-0 end-0 text-end m-2 p-2 rounded-2">
          <div v-if="isMenuExpanded" class="d-inline">
            <button v-if="type=='start'" class="btn btn-light btn-sm me-2" :class="{ active: isHighlighted }" data-bs-placement="top" title="Show modifications" @click="highlightLines">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-light btn-sm me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Import network layout" @click="importNetworkLayout">
              <i class="bi bi-file-earmark-arrow-up"></i>
            </button>
            <button class="btn btn-light btn-sm me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Export network layout" @click="exportNetworkLayout">
              <i class="bi bi-file-earmark-arrow-down"></i>
            </button>
            <button class="btn btn-light btn-sm me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Rotate network" @click="() => rotateGraph(30)">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button class="btn btn-light btn-sm me-2" :class="{ active: isFullscreen }" data-bs-toggle="tooltip" data-bs-placement="top" title="Fullscreen" @click="toggleFullscreen">
              <i class="bi bi-fullscreen"></i>
            </button>
          </div>
          <button class="btn btn-light btn-sm me" data-bs-toggle="tooltip" data-bs-placement="top" title="Toggle" @click="expandMenu">
            <i :class="isMenuExpanded ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
          </button>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useNetworkMap } from "../composables/networkMap/force/useNetworkMapForce";
  import { MapType } from "../composables/networkMap/useNetworkMapData";

  const props = defineProps<{ type: MapType }>();

  const { mapContainer, isFullscreen, isMenuExpanded, isHighlighted, hasNetwork,
          toggleFullscreen, rotateGraph, expandMenu, exportNetworkLayout,
          importNetworkLayout, highlightLines } = useNetworkMap(props.type);
</script>

<style scoped>

  .map {
    background-color: var(--map--background-color);
  }

  .map-normal {
    height: 50vh;
    position: relative;
  }
  
  .map-fullscreen {
    width: 100vw;
    height: 100vh;
    z-index: 1050;
    position: fixed;
    top: 0;
    left: 0;
  }

</style>