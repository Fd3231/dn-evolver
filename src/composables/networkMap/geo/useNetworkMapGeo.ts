import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNetworkMapUI } from "../useNetworkMapUI";
import { buildEdges, buildNodes, MapNode, MapType } from "../useNetworkMapData";
import { renderGeoMap } from "./useNetworkMapGeoRenderer";
import { GEO_MAP_CONFIG } from "../networkMapConfig";
import { useShortcuts } from "../../useShortcuts";
import { useMaps } from "../../useMaps";

export const useNetworkMapGeo = (mapType: MapType) => {
  const mapContainer = ref<HTMLElement | null>(null);
  const { networkStore, isFullscreen, isHighlighted, isMenuExpanded,
          hasNetwork, expandMenu, getEdges } = useNetworkMapUI(mapType);
  const { showGeo, showStart, showTarget } = useMaps();

  let leaflet: L.Map | null = null;
  let renderer: ReturnType<typeof renderGeoMap> | null = null;

  const buildData = () => ({
    nodes: buildNodes(networkStore.substations),
    edges: buildEdges(getEdges()),
  });

  const initLeaflet = () => {
    if (!mapContainer.value || leaflet) return;
    leaflet = L.map(mapContainer.value, { zoomControl: false });
    L.tileLayer(GEO_MAP_CONFIG.urlTemplate, { attribution: GEO_MAP_CONFIG.attribution }).addTo(leaflet);
    L.control.zoom({ position: "bottomleft" }).addTo(leaflet);
  };

  const initialize = () => {
    initLeaflet();
    if (!leaflet) return;
    const { nodes, edges } = buildData();
    if (nodes.length === 0) return;
    setLeafletView(nodes);
    renderer?.destroy();
    renderer = renderGeoMap(leaflet, nodes, edges);
  };

  const setLeafletView = (nodes: MapNode[]) => {
    if (nodes.length === 0) return;
    const { latitude, longitude } = nodes.reduce(
      (sum, node) => ({
        latitude: sum.latitude + node.latitude,
        longitude: sum.longitude + node.longitude,
      }),
      { latitude: 0, longitude: 0 }
    );
    leaflet?.setView([latitude/nodes.length, longitude/nodes.length], Math.min(nodes.length*2, leaflet.getMaxZoom()))
  }

  const update = () => {
    if (!renderer) { initialize(); return; }
    const { nodes, edges } = buildData();
    renderer.update(nodes, edges);
  };

  const highlightLines = () => { isHighlighted.value = !isHighlighted.value; update(); };

  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value;
    nextTick(() => leaflet?.invalidateSize());
  };

  useShortcuts([
    { key: 'Escape', when: () => isFullscreen.value, handler: toggleFullscreen }
  ])

  watch(showGeo, (visible) => {
    if (visible) nextTick(() => leaflet?.invalidateSize());
  });

  watch(
    () => [showStart.value, showTarget.value],
    () => {
      nextTick(() => leaflet?.invalidateSize());
    }
  )

  watch(
    () => networkStore.startLines,
    () => {
        if (!mapContainer.value) return;
        if (Object.keys(networkStore.startLines).length === 0) return;
        if (mapType === "start" && Object.keys(networkStore.startLines).length === 0) return;

        renderer ? update() : initialize();
    }
  );

  onBeforeUnmount(() => {
    renderer?.destroy();
    leaflet?.remove();
  });

  return { mapContainer, isFullscreen, isMenuExpanded, isHighlighted, hasNetwork,
          toggleFullscreen, expandMenu, highlightLines };
  };