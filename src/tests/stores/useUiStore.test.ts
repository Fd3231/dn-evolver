import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useUIStore } from "../../stores/useUiStore";

describe('useUiStore', () => {
  beforeEach(() => { 
    setActivePinia(createPinia())
  })

  it('has correct initial state', () => {
    const store = useUIStore()
    expect(store.layout).toEqual("both")
    expect(store.themeMode).toEqual("system")   
  })

  it('set theme light', () => {
    const store = useUIStore()
    store.setTheme("light");
    
    expect(store.themeMode).toEqual("light");
  })

  it('set theme dark', () => {
    const store = useUIStore()
    store.setTheme("dark");
    
    expect(store.themeMode).toEqual("dark");
  })
  
})