import * as d3 from "d3";
import type { MapNode, MapEdge, Simulation } from "../useNetworkMapData";
import { MAP_CONFIG } from "../networkMapConfig";
import { SUBSTATION_TYPE } from "../../../types";

type SVGSelection = d3.Selection<SVGSVGElement, unknown, null, undefined>;
type GSelection = d3.Selection<SVGGElement, unknown, null, undefined>;

export interface MapSelections {
  svg: SVGSelection;
  g: GSelection;
  update: (nodes: MapNode[], edges: MapEdge[]) => void;
}

const createZoom = (svg: SVGSelection, g: GSelection) => {
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([MAP_CONFIG.zoom.min, MAP_CONFIG.zoom.max])
    .on("zoom", (event) => g.attr("transform", event.transform.toString()));

  svg.call(zoom);
}

const createDrag = (simulation: Simulation) => {
  return d3
    .drag<SVGCircleElement, MapNode>()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.01).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on("drag", (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });
}

const drawEdges = (g: GSelection, edges: MapEdge[]) => {
  return g
    .selectAll<SVGPathElement, MapEdge>("path.edge")
    .data(edges, (d) => d.id)
    .join("path")
    .attr("class", "edge")
    .attr("fill", "none")
    .attr("stroke", (d) => getEdgeColor(d.type))
    .attr("stroke-width", MAP_CONFIG.edge.strokeWidth)
    .attr("stroke-dasharray", (d) => (d.status === "open" ? MAP_CONFIG.edge.openStrokeDasharray : MAP_CONFIG.edge.closeStrokeDasharray));
}

const getEdgeColor = (type: string): string => {
    return MAP_CONFIG.edge.colors[type as keyof typeof MAP_CONFIG.edge.colors] 
        ?? MAP_CONFIG.edge.colors.default;
};

const drawNodes = (
  g: GSelection,
  nodes: MapNode[],
  drag: d3.DragBehavior<SVGCircleElement, MapNode, unknown>) => {
  return g
    .selectAll<SVGCircleElement, MapNode>("circle.node")
    .data(nodes, (d) => d.id)
    .join("circle")
    .attr("class", "node")
    .attr("r", MAP_CONFIG.node.radius)
    .attr("fill", (d) =>
      d.type === SUBSTATION_TYPE.PRIMARY ? MAP_CONFIG.node.colors.primary : MAP_CONFIG.node.colors.secondary
    )
    .attr("stroke", "black")
    .attr("cursor", "pointer")
    .call(drag);
}

const drawLabels = (g: GSelection, nodes: MapNode[]) => {
  return g
    .selectAll<SVGTextElement, MapNode>("text.label")
    .data(nodes, (d) => d.id)
    .join("text")
    .attr("class", "label")
    .text((d) => d.id)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", "white")
    .attr("font-weight", "bold")
    .attr("font-size", MAP_CONFIG.label.fontSize);
}

const bindTick = (
  simulation: Simulation,
  edges: d3.Selection<SVGPathElement, MapEdge, SVGGElement, unknown>,
  nodes: d3.Selection<SVGCircleElement, MapNode, SVGGElement, unknown>,
  labels: d3.Selection<SVGTextElement, MapNode, SVGGElement, unknown>) => {
  simulation.on("tick", () => {
    edges.attr("d", (d) => {
      const source = d.source as unknown as MapNode;
      const target = d.target as unknown as MapNode;
      return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
    });
    nodes.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
    labels.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
  });
}

export function renderMap(
  svgEl: SVGSVGElement,
  nodes: MapNode[],
  edges: MapEdge[],
  simulation: Simulation ): MapSelections {

  const { width, height } = MAP_CONFIG;

  const svg = d3
    .select<SVGSVGElement, unknown>(svgEl)
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`);

  svg.selectAll("*").remove();

  const g = svg.append("g");
  const drag = createDrag(simulation);

  createZoom(svg, g);

  g.append("g").attr("class", "edges");
  g.append("g").attr("class", "nodes");
  g.append("g").attr("class", "labels");

  const update = (nodes: MapNode[], edges: MapEdge[]) => {
    const edgeSel = drawEdges(g.select("g.edges"), edges);
    const nodeSel = drawNodes(g.select("g.nodes"), nodes, drag);
    const labelSel = drawLabels(g.select("g.labels"), nodes);
    bindTick(simulation, edgeSel, nodeSel, labelSel);
  }

  update(nodes, edges);

  return { svg, g, update };
}