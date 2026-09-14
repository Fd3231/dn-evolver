import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Layout = 'both' | 'start' | 'target'
export type ThemeMode = 'system' | 'light' | 'dark'
export type MapView = 'force' | 'geo'

export const useUIStore = defineStore('ui', () => {
  const layout = ref<Layout>('both')
  const themeMode = ref<ThemeMode>('system')
  const mapView = ref<MapView>('force')

  function setTheme(m: ThemeMode) {
    themeMode.value = m
  }

  return { layout, themeMode, mapView, setTheme }
})