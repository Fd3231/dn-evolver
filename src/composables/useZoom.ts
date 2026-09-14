import { getCurrentWebview } from '@tauri-apps/api/webview'
import { ref } from 'vue'
import { useShortcuts } from './useShortcuts'

const MIN_ZOOM = 0.8
const MAX_ZOOM = 2.0
const STEP = 0.1

export function useZoom() {
  const zoom = ref(1.0)

  async function setZoom(value: number) {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
    await getCurrentWebview().setZoom(clamped)
    zoom.value = clamped
  }

  const zoomIn  = () => setZoom(zoom.value + STEP)
  const zoomOut = () => setZoom(zoom.value - STEP)
  const reset   = () => setZoom(1.0)

  useShortcuts([
    { key: '=', ctrlOrMeta: true, handler: zoomIn },
    { key: '+', ctrlOrMeta: true, handler: zoomIn },
    { key: '-', ctrlOrMeta: true, handler: zoomOut },
    { key: '0', ctrlOrMeta: true, handler: reset },
  ])

  return { zoom, setZoom, zoomIn, zoomOut, reset }
}