import * as d3 from "d3";
import { MapNode, MapEdge } from "../useNetworkMapData";
import { GEO_MAP_CONFIG } from "../networkMapConfig";
import { SUBSTATION_TYPE } from "../../../types";

export function renderGeoMap(map: L.Map, nodes: MapNode[], edges: MapEdge[]) {

  const radiusScale = d3.scalePow()
  .exponent(2)
  .domain([map.getMinZoom()+1, map.getMaxZoom()])
  .range([GEO_MAP_CONFIG.node.minRadius, GEO_MAP_CONFIG.node.maxRadius])
  .clamp(true);

  const fontSizeScale = d3.scalePow()
  .exponent(2)
  .domain([map.getMinZoom()+1, map.getMaxZoom()])
  .range([GEO_MAP_CONFIG.label.minFontSize, GEO_MAP_CONFIG.label.maxFontSize])
  .clamp(true);

  const strokeScale = d3.scalePow()
  .exponent(2)
  .domain([map.getMinZoom()+1, map.getMaxZoom()])
  .range([GEO_MAP_CONFIG.edge.minStrokeWidth, GEO_MAP_CONFIG.edge.maxStrokeWidth])
  .clamp(true);

  const svg = d3.select(map.getPanes().overlayPane).append("svg").style("position", "absolute");
  const g = svg.append("g").attr("class", "leaflet-zoom-hide");
  const edgesGroup = g.append("g").attr("class", "edges");
  const nodesGroup = g.append("g").attr("class", "nodes");
  const labelsGroup = g.append("g").attr("class", "labels");

  let nodeById = new Map(nodes.map((n) => [n.id, n]));
  let nodeSel = drawNodes(map, nodesGroup, nodes);
  let edgeSel = drawEdges(map, edgesGroup, edges, nodeById);
  let labelSel = drawLabels(map, labelsGroup, nodes);

  const reposition = () => {
    const r = radiusScale(map.getZoom());
    const fontSize = fontSizeScale(map.getZoom());
    const strokeWidth = strokeScale(map.getZoom());
    const bounds = map.getBounds();
    const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
    const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());
    
    svg.attr("width", bottomRight.x - topLeft.x)
       .attr("height", bottomRight.y - topLeft.y)
       .style("left", `${topLeft.x}px`)
       .style("top", `${topLeft.y}px`);
    
    g.attr("transform", `translate(${-topLeft.x}, ${-topLeft.y})`);

    nodeSel.attr("r", r)
           .attr("cx", (d) => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
           .attr("cy", (d) => map.latLngToLayerPoint([d.latitude, d.longitude]).y);
    edgeSel.attr("d", (d) => edgePath(map, d, nodeById))
            .attr("stroke-width", strokeWidth);
    labelSel.attr("x", (d) => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
            .attr("y", (d) => map.latLngToLayerPoint([d.latitude, d.longitude]).y)
            .attr("font-size", fontSize);
  };

  map.on("zoom viewreset move", reposition);
  reposition();

  const update = (newNodes: MapNode[], newEdges: MapEdge[]) => {
    nodeById = new Map(newNodes.map((n) => [n.id, n]));
    edgeSel = drawEdges(map, edgesGroup, newEdges, nodeById);
    nodeSel = drawNodes(map, nodesGroup, newNodes);
    labelSel = drawLabels(map, labelsGroup, newNodes);
    reposition();
  };

function drawNodes(
  map: L.Map,
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: MapNode[]
) {
  const r = radiusScale(map.getZoom());
  return g
    .selectAll<SVGCircleElement, MapNode>("circle.node")
    .data(nodes, (d) => d.id)
    .join("circle")
    .attr("class", "node")
    .attr("r", r)
    .attr("fill", (d) =>
      d.type === SUBSTATION_TYPE.PRIMARY ? GEO_MAP_CONFIG.node.colors.primary : GEO_MAP_CONFIG.node.colors.secondary
    )
    .attr("stroke", "transparent")
    .attr("cursor", "pointer")
    .attr("cx", (d) => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
    .attr("cy", (d) => map.latLngToLayerPoint([d.latitude, d.longitude]).y);
}

function drawEdges(
  map: L.Map,
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  edges: MapEdge[],
  nodeById: Map<string, MapNode>
) {
  const strokeWidth = strokeScale(map.getZoom());
  return g
    .selectAll<SVGPathElement, MapEdge>("path.edge")
    .data(edges, (d) => d.id)
    .join("path")
    .attr("class", "edge")
    .attr("fill", "none")
    .attr("opacity", 0.8)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("stroke", (d) => getEdgeColor(d.type))
    .attr("stroke-width", strokeWidth)
    .attr("stroke-dasharray", (d) => (d.status === "open" ? GEO_MAP_CONFIG.edge.openStrokeDasharray : GEO_MAP_CONFIG.edge.closeStrokeDasharray))
    .attr("d", (d) => edgePath(map, d, nodeById));
}


function drawLabels(
  map: L.Map,
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: MapNode[]
) {
  const fontSize = fontSizeScale(map.getZoom());
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
    .attr("font-size", fontSize)
    .attr("x", (d) => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
    .attr("y", (d) => map.latLngToLayerPoint([d.latitude, d.longitude]).y);
}


function edgePath(map: L.Map, d: MapEdge, nodeById: Map<string, MapNode>) {
  if (d.path && d.path.length > 0) {
    const points = d.path.map(([lon, lat]) => map.latLngToLayerPoint([lat, lon]));
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  }

  const source = nodeById.get(d.source);
  const target = nodeById.get(d.target);
  if (!source || !target) return "";
  const s = map.latLngToLayerPoint([source.latitude, source.longitude]);
  const t = map.latLngToLayerPoint([target.latitude, target.longitude]);
  return `M ${s.x} ${s.y} L ${t.x} ${t.y}`;
}

function getEdgeColor(type: string) {
    return GEO_MAP_CONFIG.edge.colors[type as keyof typeof GEO_MAP_CONFIG.edge.colors] 
        ?? GEO_MAP_CONFIG.edge.colors.default;
};

  const destroy = () => {
    map.off("zoom viewreset move", reposition);
    svg.remove();
  };

  return { svg, g, update, destroy };
}