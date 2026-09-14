import { describe, it, expect } from "vitest";
import { Line } from "../../models/Line";

describe("Line", () => {
  it("initializes with correct properties", () => {
    const line = new Line("node1", "node2", "open", "buildable", 1);

    expect(line.id).toBe("node1-node2");
    expect(line.source).toBe("node1");
    expect(line.target).toBe("node2");
    expect(line.status).toBe("open");
    expect(line.type).toBe("buildable");
    expect(line.length).toBe(1);
  });

  it("creates a Line from JSON", () => {
    const val = { source: "source", target: "target", status: "open", type: "buildable", length: 1 };
    const line = Line.fromJSON(val);

    expect(line).toBeInstanceOf(Line);
    expect(line.id).toBe("source-target");
    expect(line.source).toBe("source");
    expect(line.target).toBe("target");
    expect(line.status).toBe("open");
    expect(line.type).toBe("buildable");
    expect(line.length).toBe(1);
  });

 it("clones a Line correctly", () => {
    const line = new Line("node1", "node2", "open", "buildable", 1);
    const clone = line.clone();
    expect(clone).toBeInstanceOf(Line);
    expect(clone.id).toBe(line.id);
    expect(clone.source).toBe(line.source);
    expect(clone.target).toBe(line.target);
    expect(clone.status).toBe(line.status);
    expect(clone.type).toBe(line.type);
    expect(clone.length).toBe(line.length);
    expect(clone).not.toBe(line);
  });

  it("returns adjacent lines sharing source or target", () => {
    const line1 = new Line("A", "B", "open", "buildable",1);
    const line2 = new Line("B", "C", "open", "buildable",2);
    const line3 = new Line("A", "D", "open", "buildable",3);
    const line4 = new Line("X", "Y", "open", "buildable",4);
    const lines: Record<string, Line> = {
      [line1.id]: line1,
      [line2.id]: line2,
      [line3.id]: line3,
      [line4.id]: line4,
    };
    const adjacent = line1.getAdjacent(lines);
    expect(adjacent).toHaveLength(2);
    expect(adjacent).toContainEqual(line2);
    expect(adjacent).toContainEqual(line3);
    expect(adjacent).not.toContainEqual(line4);
  });

  it("returns empty array when no adjacent lines exist", () => {
    const line1 = new Line("A", "B", "open", "buildable",1);
    const line2 = new Line("X", "Y", "open", "buildable",2);
    const lines: Record<string, Line> = {
      [line1.id]: line1,
      [line2.id]: line2,
    };
    expect(line1.getAdjacent(lines)).toHaveLength(0);
  });

  it("does not include itself in adjacent lines", () => {
    const line1 = new Line("A", "B", "open", "buildable",1);
    const lines: Record<string, Line> = { [line1.id]: line1 };
    expect(line1.getAdjacent(lines)).toHaveLength(0);
  });

});