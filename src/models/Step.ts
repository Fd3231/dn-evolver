import { Action } from "./Action";
import { Line } from "./Line";

export class Step {
    id: number;
    actions: Action[];
    nodes: Node[];
    lines: Record<string,Line>;
    cost: number;

    constructor(id: number, actions: Action[], nodes: Node[] = [], lines: Record<string,Line> = {}) {
        this.id = id;
        this.actions = actions;
        this.nodes = nodes;
        this.lines = lines;
        this.cost = 0;
    }

    static fromJSON(val: any): Step {
        return new Step(parseInt(val.id), val.actions.map(Action.fromJSON));
    }
}