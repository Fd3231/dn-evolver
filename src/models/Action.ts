export class Action {
    name: string;
    params: string[];
    cost: number;

    constructor(name: string, params:string[], cost:number = 0) {
        this.name = name;
        this.params = params;
        this.cost = cost;
    }

    static fromJSON(val: any): Action {
        return new Action(val.action, val.params);
    }

}