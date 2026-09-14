import { computed} from 'vue'
import { useUIStore } from '../stores/useUiStore';

export const useMaps = () => {
    const ui = useUIStore();

    const showStart = computed(() => ui.layout === 'both' || ui.layout === 'start')
    const showTarget = computed(() => ui.layout === 'both' || ui.layout === 'target')

    const showForce = computed(() => ui.mapView === 'force')
    const showGeo = computed(() => ui.mapView === 'geo')

  return { showStart, showTarget, showForce, showGeo }
}