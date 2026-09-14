import * as d3 from "d3";
import type { MapNode, MapEdge } from "../useNetworkMapData";
import { buildDegreeMap } from "../useNetworkMapData";
import { MAP_CONFIG } from "../networkMapConfig";

type Simulation = d3.Simulation<MapNode, MapEdge>;

const buildChargeForce = (edges: MapEdge[]) => {
  const degreeMap = buildDegreeMap(edges);
  return d3.forceManyBody<MapNode>().strength(
    (d) => -(degreeMap.get(d.id) ?? 1) * MAP_CONFIG.simulation.chargePerLink
  );
}

export const createSimulation = (nodes: MapNode[], edges: MapEdge[]) : Simulation => {
  const { width, height } = MAP_CONFIG;
  const { linkDistance, collideRadius, centerStrength, velocityDecay } = MAP_CONFIG.simulation;
  
  const force = buildChargeForce(edges);
  
  return d3
    .forceSimulation<MapNode,MapEdge>(nodes)
    .force("link", d3.forceLink(edges).id((d: any) => d.id).distance(linkDistance))
    .force("charge", force)
    .force("center", d3.forceCenter(width/2, height/2))
    .force("collision", d3.forceCollide(collideRadius))
    .force("x", d3.forceX(width/2).strength(centerStrength))
    .force("y", d3.forceY(height/2).strength(centerStrength))
    .velocityDecay(velocityDecay);
}

export const updateSimulationEdges = (
  simulation: Simulation,
  newEdges: MapEdge[]
) => {
  const linkForce = simulation.force<d3.ForceLink<MapNode, MapEdge>>("link");
  if (linkForce) {
    linkForce.links(newEdges as any);
  }

  simulation.alpha(0.1).restart();
};

export const updateSimulationOnResize = (
  simulation: Simulation,
  width: number,
  height: number
) => {
  simulation
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(MAP_CONFIG.simulation.centerStrength))
    .force("y", d3.forceY(height / 2).strength(MAP_CONFIG.simulation.centerStrength))
    .alpha(MAP_CONFIG.simulation.reheadAlpha)
    .restart();
}