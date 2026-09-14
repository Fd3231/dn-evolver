import { describe, it, expect, vi } from "vitest";
import { cloneLines, formatCurrency, mapRecord, readFileAsText, simulateStep } from "../../utils/utils";
import { ACTION, LINE_STATUS, LINE_TYPE } from "../../types";
import { Line } from "../../models/Line";
import { Action } from "../../models/Action";

describe("readFileAsText", () => {
    it("resolves with file content as text", async () => {
        const content = '{"key": "value"}';
        const file = new File([content], "test.json", { type: "application/json" });
        const result = await readFileAsText(file);
        expect(result).toBe(content);
    });

    it("rejects when result is not a string", async () => {
    const file = new File(["content"], "test.json", { type: "application/json" });

    vi.stubGlobal("FileReader", function () {
        const reader = {
        onload: null as any,
        onerror: null as any,
        readAsText: function () {
            this.onload({ target: { result: null } });
        },
        };
        return reader;
    });

    await expect(readFileAsText(file)).rejects.toBe("Failed to read file");
    vi.unstubAllGlobals();
    });

    it("rejects with message when FileReader errors", async () => {
    const file = new File(["content"], "test.json", { type: "application/json" });

    vi.stubGlobal("FileReader", function () {
        const reader = {
        onload: null as any,
        onerror: null as any,
        error: { message: "Failed to read file" },
        readAsText: function () {
            this.onerror();
        },
        };
        return reader;
    });

    await expect(readFileAsText(file)).rejects.toBe("Failed to read file");
      vi.unstubAllGlobals();
    });
})

describe("mapRecord", () => {
  it("maps a record keyed by the provided getKey function", () => {
    const data = {
      a: { id: "1", value: 1 },
      b: { id: "2", value: 2 },
    };
    const result = mapRecord(data, (val) => val, (obj) => obj.id);
    expect(result).toEqual({
      "1": { id: "1", value: 1 },
      "2": { id: "2", value: 2 },
    });
  });

  it("returns an empty record when data is empty", () => {
    const result = mapRecord({}, (val) => val, (obj) => obj);
    expect(result).toEqual({});
  });

  it("passes each value to fromJSON", () => {
    const fromJSON = vi.fn((val) => ({ id: String(val) }));
    const data = { a: 1, b: 2 };
    mapRecord(data, fromJSON, (obj) => obj.id);
    expect(fromJSON).toHaveBeenCalledTimes(2);
    expect(fromJSON).toHaveBeenCalledWith(1);
    expect(fromJSON).toHaveBeenCalledWith(2);
  });
});

describe('simulateStep', () => {
  type LineStatus = typeof LINE_STATUS[keyof typeof LINE_STATUS]
  type LineType = typeof LINE_TYPE[keyof typeof LINE_TYPE]
  const makeLine = (source: string, target: string, status: LineStatus, type: LineType | '', length: number) =>
    new Line(source, target, status, type as any, length)

  it('reset ADDED/SWITCHED types in the next step', () => {
    const lines = {
      'A-B': makeLine('A', 'B', LINE_STATUS.OPEN, LINE_TYPE.ADDED, 1),
      'C-D': makeLine('C', 'D', LINE_STATUS.OPEN, LINE_TYPE.SWITCHED, 1),
    }
    const result = simulateStep(lines, [])
    expect(result['A-B'].type).toBe('')
    expect(result['C-D'].type).toBe('')
  })

  it('filters out REMOVED lines', () => {
    const lines = {
      'A-B': makeLine('A', 'B', LINE_STATUS.OPEN, LINE_TYPE.REMOVED, 1),
    }
    const result = simulateStep(lines, [])
    expect(result['A-B']).toBeUndefined()
  })

  it('applies ADD action', () => {
    const lines = {'X-Y': makeLine('X', 'Y', LINE_STATUS.OPEN, LINE_TYPE.BUILDABLE, 1)}
    const action = new Action(ACTION.ADD, ['X', 'Y'])
    const result = simulateStep(lines, [action])
    expect(result['X-Y']).toBeDefined()
    expect(result['X-Y'].type).toBe(LINE_TYPE.ADDED)
    expect(result['X-Y'].status).toBe(LINE_STATUS.OPEN)
  })

  it('applies REMOVE action', () => {
    const lines = {
      'A-B': makeLine('A', 'B', LINE_STATUS.OPEN, '', 1),
    }
    const action = new Action(ACTION.REMOVE, ['A', 'B'])
    const result = simulateStep(lines, [action])
    expect(result['A-B'].type).toBe(LINE_TYPE.REMOVED)
  })

  it('applies SWITCH action (toggles status on related lines)', () => {
    const lines = {
      'N-A': makeLine('N', 'A', LINE_STATUS.OPEN, '', 1),
      'N-B': makeLine('N', 'B', LINE_STATUS.CLOSED, '', 1),
    }
    const action = new Action(ACTION.SWITCH, ['N', 'A', 'B'])
    const result = simulateStep(lines, [action])

    expect(result['N-A'].status).toBe(LINE_STATUS.CLOSED)
    expect(result['N-A'].type).toBe(LINE_TYPE.SWITCHED)
    expect(result['N-B'].status).toBe(LINE_STATUS.OPEN)
    expect(result['N-B'].type).toBe(LINE_TYPE.SWITCHED)
  })

  it('SWITCH skips keys that do not exist', () => {
    const lines = {}
    const action = new Action(ACTION.SWITCH, ['N', 'A', 'B'])
    expect(() => simulateStep(lines, [action])).not.toThrow()
  })

  it('ignores unknown action names', () => {
    const lines = {
      'A-B': makeLine('A', 'B', LINE_STATUS.OPEN, '', 1),
    }
    const unknownAction = new Action('UNKNOWN' as any, [])
    const result = simulateStep(lines, [unknownAction])

    expect(result['A-B'].status).toBe(LINE_STATUS.OPEN)
  })
})

describe('cloneLines', () => {
  it('returns a deep clone', () => {
    const original = {
      'A-B': new Line('A', 'B', LINE_STATUS.OPEN, LINE_TYPE.ADDED, 1),
    }
    const cloned = cloneLines(original)

    expect(cloned['A-B']).not.toBe(original['A-B'])
    expect(cloned['A-B'].source).toBe(original['A-B'].source)
  })

  it('handles empty input', () => {
    expect(cloneLines({})).toEqual({})
  })
})

describe('formatCurrency', () => {
  it('formats EUR with no decimals', () => {
    const result = formatCurrency(1234)
    expect(result).toMatch(/€/)
    expect(result).toMatch(/1[.,]?234/)
  })

  it('formats USD in en-US locale', () => {
    const result = formatCurrency(9999.99, 'USD', 'en-US', 2)
    expect(result).toBe('$9,999.99')
  })

  it('formats zero correctly', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
    expect(result).toContain('€')
  })

  it('formats negative values', () => {
    const result = formatCurrency(-500, 'EUR', 'en-GB', 0)
    expect(result).toContain('500')
  })
})