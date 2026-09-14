import { Action } from "../models/Action";
import { Line } from "../models/Line";
import { ACTION, LINE_STATUS, LINE_TYPE } from "../types";

export const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
            resolve(event.target.result);
        } else {
            reject("Failed to read file");
        }
        };
        
        reader.onerror = () => reject(reader.error?.message);
        
        reader.readAsText(file);
    });
};

export const mapRecord = <T>(data: any, fromJSON: (val: any) => T, getKey: (obj: T) => string): Record<string, T> => {
  return Object.values(data).reduce<Record<string, T>>((acc, val) => {
    const obj = fromJSON(val as any);
    acc[getKey(obj)] = obj;
    return acc;
  }, {});
};

export const simulateStep = (lines: Record<string,Line>, actions: Action[]): Record<string,Line> => {
    const nextStepLines: Record<string, Line> = Object.fromEntries(
        Object.entries(lines)
        .filter(([_, line]) => line.type !== LINE_TYPE.REMOVED)
        .map(([k, line]) => {
            const cloned = line.clone();
            if (cloned.type === LINE_TYPE.ADDED || cloned.type === LINE_TYPE.SWITCHED) {
                cloned.type = "";
            }
            return [k, cloned];
        })
    );

    actions.forEach((action) => {
        if (action.name == ACTION.ADD) {
            const key = `${action.params[0]}-${action.params[1]}`;
            nextStepLines[key] = new Line(action.params[0], action.params[1], LINE_STATUS.OPEN, LINE_TYPE.ADDED, lines[key].clone().length);
        } else if (action.name == ACTION.REMOVE) {
            const key = `${action.params[0]}-${action.params[1]}`;
            nextStepLines[key] = new Line(action.params[0], action.params[1], nextStepLines[key].status, LINE_TYPE.REMOVED, lines[key].clone().length);
        } else if (action.name == ACTION.SWITCH) {
            const [common, from, to] = action.params;
            const tryUpdate = (key: string) => {
                if (nextStepLines[key]) {
                    const opposite = nextStepLines[key].status === LINE_STATUS.OPEN ? LINE_STATUS.CLOSED : LINE_STATUS.OPEN;
                    nextStepLines[key] = new Line(nextStepLines[key].source, nextStepLines[key].target, opposite, LINE_TYPE.SWITCHED, lines[key].clone().length);
                }
            };
            tryUpdate(`${common}-${from}`);
            tryUpdate(`${from}-${common}`);
            tryUpdate(`${common}-${to}`);
            tryUpdate(`${to}-${common}`);
        }
    });
    return nextStepLines;
}

export const cloneLines = (lines: Record<string, Line>) => 
    Object.fromEntries(Object.entries(lines).map(([k, v]) => [k, v.clone()]));

export const formatCurrency = (value: number, currency = 'EUR', locale = 'it-IT', decimals=0): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}