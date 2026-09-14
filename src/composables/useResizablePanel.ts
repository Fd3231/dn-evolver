import { ref } from "vue"

export const MIN_HEIGHT_VH = 44
export const MAX_HEIGHT_VH = 80

export const useResizablePanel = () => {
  const panelHeight = ref(MIN_HEIGHT_VH)

  function startDrag(e: MouseEvent) {
    e.preventDefault()
    const startY = e.clientY
    const panel = document.querySelector('.panel-root') as HTMLElement
    const startHeightVh = ((panel?.offsetHeight ?? 200) / window.innerHeight) * 100

    const onMove = (e: MouseEvent) => {
      const deltaVh = (startY - e.clientY) / window.innerHeight * 100
      panelHeight.value = Math.max(MIN_HEIGHT_VH, Math.min(MAX_HEIGHT_VH, startHeightVh + deltaVh))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return { panelHeight, startDrag }
}