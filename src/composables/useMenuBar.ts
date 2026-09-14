import { Dropdown } from 'bootstrap'
import { computed, onMounted, ref } from 'vue'
import { useUIStore } from '../stores/useUiStore';

export const useMenuBar = () => {
    const navRef = ref<HTMLElement | null>(null);
    const ui = useUIStore();
    
    const layout = computed({
        get: () => ui.layout,
        set: (val) => { ui.layout = val }
    })

    const mapView = computed({
        get: () => ui.mapView,
        set: (val) => { ui.mapView = val }
    })

    const themeMode = computed(() => ui.themeMode)
    const setTheme = ui.setTheme

    onMounted(() => {
        const navItems = navRef.value?.querySelectorAll<HTMLElement>('.nav-item.dropdown')
        if (!navItems) return

        const dropdowns = new Map<HTMLElement, Dropdown>()
        let currentOpen: HTMLElement | null = null

        navItems.forEach(item => {
            const link = item.querySelector<HTMLElement>('.nav-link')!
            const dd = new Dropdown(link)
            dropdowns.set(item, dd)

            item.addEventListener('show.bs.dropdown', () => {
                currentOpen = item
                item.querySelector('.nav-link')?.classList.add('active')
            })

            item.addEventListener('hide.bs.dropdown', () => {
                currentOpen = null
                item.querySelector('.nav-link')?.classList.remove('active')
            })

            item.addEventListener('mouseenter', () => {
                if (!currentOpen || currentOpen === item) return
                dropdowns.get(currentOpen)?.hide()
                dd.show()
            })
        })
    })

  return { navRef, layout, themeMode, mapView, setTheme }
}