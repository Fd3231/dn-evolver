import { Line } from "../../models/Line";
import { Substation } from "../../models/Substation";

export type Simulation = d3.Simulation<MapNode, MapEdge>;
export type MapType = 'start' | 'end';

export interface MapNode {
  id: string;
  type: string;
  latitude: number;
  longitude: number;

  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
}

export interface MapEdge {
  id: string;
  source: string;
  target: string;
  status: string;
  type: string;

  path?: [number, number][];
}

export const buildNodes = (substations: Record<string, Substation>): MapNode[] => {
  return Object.values(substations).map((s) => ({
    id: s.id,
    x: 0,
    y: 0,
    type: s.type,
    latitude: s.latitude,
    longitude: s.longitude
  }));
}

export const buildEdges = (lines: Record<string, Line>): MapEdge[] => {
  return Object.values(lines).map((l) => ({
    id: l.id,
    source: l.source,
    target: l.target,
    status: l.status,
    type: l.type,
    path: l.path
  }));
}

export const buildDegreeMap = (edges: MapEdge[]): Map<string, number> => {
  const map = new Map<string, number>();
  edges.forEach(({ source, target }) => {
    map.set(source, (map.get(source) ?? 0) + 1);
    map.set(target, (map.get(target) ?? 0) + 1);
  });
  return map;
}