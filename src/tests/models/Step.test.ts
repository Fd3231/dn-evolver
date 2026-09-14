import { describe, it, expect } from "vitest";
import { Step } from "../../models/Step";
import { Action } from "../../models/Action";

describe("Step", () => {
    it("initializes with correct properties", () => {
        const action = new Action("add", ["a1", "a2", "a3"]);
        const step = new Step(0, [action]);

        expect(step.id).toBe(0);
        expect(step.actions).toContain(action);
        expect(step.nodes).toStrictEqual([]);
        expect(step.lines).toStrictEqual({});
        expect(step.cost).toBe(0);
    });

    it("creates a Step from JSON", () => {
        const val = {
            id: "0",
            actions: [
                { action: "add", params: ["a1", "a2"] },
                { action: "remove", params: ["b1"] },
            ],
        };
        const step = Step.fromJSON(val);

        expect(step).toBeInstanceOf(Step);
        expect(step.id).toBe(0);
        expect(step.actions).toHaveLength(2);
        expect(step.actions[0]).toBeInstanceOf(Action);
        expect(step.actions[0].name).toBe("add");
        expect(step.actions[1].name).toBe("remove");
        expect(step.nodes).toStrictEqual([]);
        expect(step.lines).toStrictEqual({});
        expect(step.cost).toBe(0);
    });

});