import { watch } from 'vue'
import { useUIStore, ThemeMode } from '../stores/useUiStore'

export function useTheme() {
  const ui = useUIStore()

  const saved = localStorage.getItem('theme') as ThemeMode
  if (saved) ui.themeMode = saved

  function getSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function applyTheme() {
    const resolved = ui.themeMode === 'system' ? getSystemTheme() : ui.themeMode
    document.documentElement.setAttribute('data-bs-theme', resolved)
  }

  applyTheme()

  watch(() => ui.themeMode, (val) => {
    applyTheme()
    localStorage.setItem('theme', val)
  })

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    if (ui.themeMode === 'system') applyTheme()
  })
}