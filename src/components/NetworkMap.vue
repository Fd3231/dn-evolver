<template>
  <NetworkMapForce v-show="showForce" :type="type" />
  <NetworkMapGeo v-show="showGeo" :type="type" />
</template>

<script setup lang="ts">

  import NetworkMapForce from "./NetworkMapForce.vue";
  import NetworkMapGeo from "./NetworkMapGeo.vue";
  import { MapType } from "../composables/networkMap/useNetworkMapData";
  import { useMaps } from "../composables/useMaps.ts";

  defineProps<{ type: MapType }>();

  const { showForce, showGeo } = useMaps();

</script>