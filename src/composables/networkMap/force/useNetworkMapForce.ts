import { nextTick, ref, watch } from "vue";
import * as d3 from "d3";
import { save, open as openDialog } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { buildNodes, buildEdges, MapNode, Simulation, MapType } from "../useNetworkMapData";
import { renderMap } from "./useNetworkMapForceRenderer";
import { MAP_CONFIG } from "../networkMapConfig";
import { useToast } from "../../useToast";
import { useShortcuts } from "../../useShortcuts";
import { useNetworkMapUI } from "../useNetworkMapUI";
import { createSimulation, updateSimulationEdges, updateSimulationOnResize } from "./useNetworkMapForceSimulation";

export const useNetworkMap = (mapType: MapType) => {
  
  const mapContainer = ref<SVGSVGElement | null>(null);

  const { networkStore, isFullscreen, isHighlighted, isMenuExpanded,
          hasNetwork, expandMenu, getEdges } = useNetworkMapUI(mapType);
  
  const fileInput = ref<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  let simulation: Simulation;
  let selections: ReturnType<typeof renderMap> | null = null;

  const initialize = () => {
    if (!mapContainer.value) return;

    const nodes = buildNodes(networkStore.substations);
    const edges = buildEdges(getEdges());
    if (nodes.length === 0) return;

    simulation = createSimulation(nodes, edges);
    selections = renderMap(mapContainer.value, nodes, edges, simulation);
  }

  const update = () => {
    if (!simulation || !selections) return;

      const newEdges = buildEdges(getEdges());
      updateSimulationEdges(simulation, newEdges);
      selections.update(simulation.nodes(), newEdges);
  };

  const highlightLines = () => {
    isHighlighted.value = !isHighlighted.value;
    update();  
  }

  const resizeMap = () => {
    if (!mapContainer.value || !simulation) return;

    const width = isFullscreen.value ? mapContainer.value.clientWidth : MAP_CONFIG.width;
    const height = isFullscreen.value ? mapContainer.value.clientHeight : MAP_CONFIG.height;
    d3.select(mapContainer.value).attr("viewBox", `0 0 ${width} ${height}`);
    updateSimulationOnResize(simulation, width, height);
  };

  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value;
    nextTick(resizeMap);
  };

  const rotateGraph = (angleDeg = 30) => {
    if (!simulation || !selections) return;
    const nodes = simulation.nodes();

    const center = {
      x: d3.mean(nodes, d => d.x) ?? 0,
      y: d3.mean(nodes, d => d.y) ?? 0,
    };

    const angleRad = (angleDeg * Math.PI) / 180;
    const startPositions = nodes.map(n => ({ x: n.x, y: n.y }));

    d3.transition()
      .duration(500)
      .ease(d3.easeCubicInOut)
      .tween("rotate", () => (t) => {
        nodes.forEach((node, i) => {
          const dx = startPositions[i].x! - center.x;
          const dy = startPositions[i].y! - center.y;
          node.x = dx * Math.cos(angleRad * t) - dy * Math.sin(angleRad * t) + center.x;
          node.y = dx * Math.sin(angleRad * t) + dy * Math.cos(angleRad * t) + center.y;
          node.fx = node.x;
          node.fy = node.y;
        });
        selections!.update(nodes, simulation!.force<d3.ForceLink<MapNode, any>>("link")!.links());
      })
      .on("end", () => {
        nodes.forEach(n => { n.fx = null; n.fy = null; });
        simulation!.alpha(MAP_CONFIG.simulation.reheadAlpha).restart();
      });
  };

  const exportNetworkLayout = async (): Promise<void> => {
    try {
      const filePath = await save({ defaultPath: 'data.json' });
      if (filePath) {
        await writeTextFile(filePath, JSON.stringify(simulation.nodes(), null, 2));
        showToast('File saved successfully!', 'secondary');
      }
    } catch (e) {
      showToast('Error saving file.', 'danger');
    }
  };

  const importNetworkLayout = async (): Promise<void> => {
    const filePath = await openDialog({
      filters: [{ name: 'JSON', extensions: ['json'] }],
      multiple: false,
    });

    if (!filePath) return;

    const text = await readTextFile(filePath as string);
    const objects = JSON.parse(text) as { id: string; x: number; y: number }[];

    if (!isValidCoordinates(objects)) {
      showToast('Invalid file format.', 'danger');
      return;
    }

    objects.forEach(object => {
      const node = simulation.nodes().find(node => node.id === object.id);
      if (node) {
        node.x = object.x;
        node.y = object.y;
      }
    });

    simulation!.alpha(MAP_CONFIG.simulation.reheadAlpha).restart();
    showToast('Coordinates imported successfully!', 'secondary');
  };

  const isValidCoordinates = (data: unknown): data is { id: string; x: number; y: number }[] => {
    return (
      Array.isArray(data) &&
      data.every(
        item =>
          typeof item === 'object' && item !== null &&
          'id' in item && typeof (item as any).id === 'string' &&
          'x'  in item && typeof (item as any).x  === 'number' &&
          'y'  in item && typeof (item as any).y  === 'number'
      )
    );
  };

  watch(
    () => networkStore.startLines,
    () => {
      if (Object.keys(networkStore.startLines).length === 0) return;
      
      if (simulation && mapType == "start" && networkStore.initialized > 0) {
        update();
      } else if (mapType == "end" && networkStore.initialized < 2) {
        initialize();
        networkStore.initialized+=1;
      } else if (mapType == "start" && networkStore.initialized == 0) {
        initialize();
        networkStore.initialized+=1;
      }
    }
  );

  useShortcuts([
    { key: 'Escape', when: () => isFullscreen.value, handler: toggleFullscreen }
  ])

  return { mapContainer, isFullscreen, isMenuExpanded, fileInput, isHighlighted,
          toggleFullscreen, rotateGraph, expandMenu, exportNetworkLayout,
          importNetworkLayout, highlightLines, hasNetwork};
}