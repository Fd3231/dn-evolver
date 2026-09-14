import { describe, it, expect } from "vitest";
import { Action } from "../../models/Action";

describe("Action", () => {
    it("initializes with correct properties", () => {
        const action = new Action("add", ["a1", "a2", "a3"]);

        expect(action.name).toBe("add");
        expect(action.params).toStrictEqual(["a1", "a2", "a3"]);
        expect(action.cost).toBe(0);
    });

    it("creates an Action from JSON", () => {
        const val = { action: "add", params: ["a1", "a2", "a3"] };
        const action = Action.fromJSON(val);

        expect(action).toBeInstanceOf(Action);
        expect(action.name).toBe("add");
        expect(action.params).toStrictEqual(["a1", "a2", "a3"]);
        expect(action.cost).toBe(0);
    });

});