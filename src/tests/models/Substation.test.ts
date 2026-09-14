import { describe, it, expect } from "vitest";
import { Substation } from "../../models/Substation";

describe("Substation", () => {
    it("initializes with correct properties", () => {
        const sub = new Substation("node1", "primary");

        expect(sub.id).toBe("node1");
        expect(sub.type).toBe("primary");
    });

    it("creates a Substation from JSON", () => {
        const val = { id: "node1", type: "primary" };
        const substation = Substation.fromJSON(val);

        expect(substation).toBeInstanceOf(Substation);
        expect(substation.id).toBe("node1");
        expect(substation.type).toBe("primary");
    });

});