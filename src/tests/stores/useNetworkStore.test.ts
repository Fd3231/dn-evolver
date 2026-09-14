import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useNetworkStore } from "../../stores/useNetworkStore";
import { Line } from "../../models/Line";
import { Substation } from "../../models/Substation";
import { LINE_STATUS, LINE_TYPE } from "../../types";

const makeLine = (source: string, target: string, type: string, length: number) =>
  new Line(source, target, LINE_STATUS.OPEN, type, length as any);

const makeSubstation = (id: string, type: string) => new Substation(id, type);

describe('useNetworkStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has correct initial state', () => {
    const store = useNetworkStore()
    expect(store.substations).toEqual({})
    expect(store.startLines).toEqual({})
    expect(store.targetLines).toEqual({})
    expect(store.initialized).toBe(0)
  })

  describe('initializeNetwork', () => {
    it('sets substations, lines and initialize flag', () => {
      const store = useNetworkStore()
      const substations = { 'S1': makeSubstation('S1', 'PRIMARY') }
      const startLines = { 'A-B': makeLine('A', 'B', '', 1) }
      const targetLines = { 'C-D': makeLine('C', 'D', '', 1) }

      store.initializeNetwork(substations, startLines, targetLines)

      expect(store.substations).toEqual(substations)
      expect(store.startLines).toEqual(startLines)
      expect(store.targetLines).toEqual(targetLines)
    })

    it('sets originalStartLines to the same value as startLines', () => {
      const store = useNetworkStore()
      const startLines = { 'A-B': makeLine('A', 'B', '', 1) }

      store.initializeNetwork({}, startLines, {})

      store.startLines = {} as any
      store.resetStartLines()
      expect(store.startLines).toEqual(startLines)
    })
  })

    describe('resetStartLines', () => {
    it('restores startLines to the original value', () => {
      const store = useNetworkStore()
      const startLines = { 'A-B': makeLine('A', 'B', '', 1) }
      store.initializeNetwork({}, startLines, {})

      store.startLines['X-Y'] = makeLine('X', 'Y', LINE_TYPE.ADDED, 1)
      store.resetStartLines()

      expect(store.startLines).toEqual(startLines)
    })
  })

  describe('getDefaultLines', () => {
    it('excludes BUILDABLE and REMOVED lines', () => {
      const store = useNetworkStore()
      store.initializeNetwork({}, {
        'A-B': makeLine('A', 'B', LINE_TYPE.BUILDABLE, 1),
        'C-D': makeLine('C', 'D', LINE_TYPE.REMOVED, 1),
        'E-F': makeLine('E', 'F', '', 1),
      }, {})

      const result = store.getDefaultLines()
      expect(result['A-B']).toBeUndefined()
      expect(result['C-D']).toBeUndefined()
      expect(result['E-F']).toBeDefined()
    })

    it('resets type for ADDED lines', () => {
      const store = useNetworkStore()
      store.initializeNetwork({}, {
        'A-B': makeLine('A', 'B', LINE_TYPE.ADDED, 1),
      }, {})

      const result = store.getDefaultLines()
      expect(result['A-B'].type).toBe('')
    })

    it('resets type for SWITCHED lines', () => {
      const store = useNetworkStore()
      store.initializeNetwork({}, {
        'A-B': makeLine('A', 'B', LINE_TYPE.SWITCHED, 1),
      }, {})

      const result = store.getDefaultLines()
      expect(result['A-B'].type).toBe('')
    })

    it('keeps other lines as-is', () => {
      const store = useNetworkStore()
      const line = makeLine('A', 'B', '', 1)
      store.initializeNetwork({}, { 'A-B': line }, {})

      const result = store.getDefaultLines()
      expect(result['A-B']).toStrictEqual(line)
    })
  })

  describe('getHighlightedLines', () => {
    it('excludes BUILDABLE lines', () => {
      const store = useNetworkStore()
      store.initializeNetwork({}, {
        'A-B': makeLine('A', 'B', LINE_TYPE.BUILDABLE, 1),
        'C-D': makeLine('C', 'D', '', 1),
        'E-F': makeLine('E', 'F', LINE_TYPE.ADDED, 1),
      }, {})

      const result = store.getHighlightedLines()
      expect(result['A-B']).toBeUndefined()
      expect(result['C-D']).toBeDefined()
      expect(result['E-F']).toBeDefined()
    })

    it('returns empty object when all lines are BUILDABLE', () => {
      const store = useNetworkStore()
      store.initializeNetwork({}, {
        'A-B': makeLine('A', 'B', LINE_TYPE.BUILDABLE, 1),
      }, {})

      expect(store.getHighlightedLines()).toEqual({})
    })
  })

})