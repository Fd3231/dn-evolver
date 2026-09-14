export class Line {
    id: string;
    source: string;
    target: string;
    status: string;
    type: string;
    length: number;
    path: [number, number][];

    constructor(source: string, target: string, status: string, type: string, length: number, path: [number, number][] = []) {
        this.id = source+"-"+target
        this.source = source;
        this.target = target;
        this.status = status;
        this.type = type;
        this.length = length;
        this.path = path;
    }

    static fromJSON(val: any): Line {
        return new Line(val.source, val.target, val.status, val.type, val.length, val.path);
    }

    clone(): Line {
        return new Line(this.source, this.target, this.status, this.type, this.length, this.path);
    }

    getAdjacent(lines: Record<string, Line>): Line[] {
        return Object.values(lines).filter(l =>
            l.id !== this.id &&
            (l.source === this.source || l.source === this.target ||
            l.target === this.source || l.target === this.target)
        );
    }

}