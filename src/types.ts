export interface CostConfig {
  add: number;
  remove: number;
  switch: number;
  fixed: number;
}

export interface ValidationResult {
  Efault: boolean
  'Efault+': boolean
  Pfault: boolean
  'Pfault+': boolean
  degree: boolean
  rad: boolean
  target_reached: boolean
  step?: number
  last_action?: string
}

export const ACTION = {
    ADD: 'add',
    REMOVE: 'remove',
    SWITCH: 'switch',
} as const;

export const LINE_TYPE = {
    BUILDABLE: 'buildable',
    REMOVABLE: 'removable',
    SWITCHED: 'switched',
    ADDED: 'added',
    REMOVED: 'removed'
} as const;

export const SUBSTATION_TYPE = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary'
}

export type ActionType = typeof ACTION[keyof typeof ACTION];

export const LINE_STATUS = {
    OPEN: 'open',
    CLOSED: 'closed',
} as const;

export const ACTION_COST_KEY: Record<ActionType, keyof CostConfig | null> = {
    [ACTION.ADD]: 'add',
    [ACTION.REMOVE]: 'remove',
    [ACTION.SWITCH]: 'switch',
};