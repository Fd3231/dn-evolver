import { onUnmounted } from 'vue'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  ctrlOrMeta?: boolean
  when?: () => boolean
  handler: () => void
}

const registry: Shortcut[] = []

function matchesShortcut(e: KeyboardEvent, shortcut: Shortcut): boolean {
  const ctrlOrMeta = shortcut.ctrlOrMeta ? (e.ctrlKey || e.metaKey) : true
  return (
    e.key === shortcut.key &&
    (shortcut.ctrlOrMeta ? ctrlOrMeta : !!shortcut.ctrl === e.ctrlKey) &&
    !!shortcut.shift === e.shiftKey &&
    !!shortcut.alt === e.altKey &&
    (shortcut.meta !== undefined ? !!shortcut.meta === e.metaKey : true)
  )
}

window.addEventListener('keydown', (e: KeyboardEvent) => {
  const tag = (e.target as HTMLElement).tagName
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return

  for (let i = registry.length - 1; i >= 0; i--) {
    const shortcut = registry[i]
    if (matchesShortcut(e, shortcut)) {
      if (shortcut.when && !shortcut.when()) continue
      e.preventDefault()
      shortcut.handler()
      break
    }
  }
})

export function useShortcuts(shortcuts: Shortcut[]): void {
  registry.push(...shortcuts)

  onUnmounted(() => {
    shortcuts.forEach(s => {
      const i = registry.indexOf(s)
      if (i !== -1) registry.splice(i, 1)
    })
  })
}