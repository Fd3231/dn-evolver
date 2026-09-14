<template>
    <div class="container-full row mt-2 ms-2 me-2">
        <ul class="nav nav-pills" ref="navRef">
            <li class="nav-item dropdown me-2 ms-2 small">
                <a class="nav-link text-body" data-bs-toggle="dropdown">File</a>
                <ul class="dropdown-menu p-1">
                    <li class="p-0 mb-1">
                        <input ref="instanceFileInput" type="file" class="d-none" accept=".json,application/json" @change="handleFileChange('instance', $event)" />
                        <button class="dropdown-item small" @click="openFile('instance')">Open instance...</button>
                    </li>
                    <li class="p-0">
                        <input ref="planFileInput" type="file" class="d-none" accept=".json,application/json" @change="handleFileChange('plan', $event)">
                        <button class="dropdown-item small" :disabled="!instanceFile" @click="openFile('plan')">Open plan...</button>
                    </li>
                    <hr class="m-0">
                    <li class="p-0">
                        <button class="dropdown-item small" :disabled="!instanceFile" @click="planStore.initializeEmptyPlan()">New plan</button>
                    </li>
                </ul>
            </li>
            <li class="nav-item dropdown me-2 small">
            <a class="nav-link text-body" data-bs-toggle="dropdown">View</a>
            <ul class="dropdown-menu dropdown-menu-end p-1">
                <li class="p-0 position-relative submenu-parent">
                    <button class="dropdown-item small" @click.stop>Layout<i class="bi bi-chevron-right float-end"></i></button>
                    <ul class="dropdown-menu submenu position-absolute top-0 start-100 p-1">
                        <li class="p-0">
                            <button class="dropdown-item small" @click="layout = 'both'">
                                <i :class="['bi bi-check-lg me-1', { invisible: layout !== 'both' }]"></i>
                                Both
                            </button>
                        </li>
                        <li class="p-0">
                            <button class="dropdown-item small" @click="layout = 'start'">
                                <i :class="['bi bi-check-lg me-1', { invisible: layout !== 'start' }]"></i>
                                Start only
                            </button>
                        </li>
                        <li class="p-0">
                            <button class="dropdown-item small" @click="layout = 'target'">
                                <i :class="['bi bi-check-lg me-1', { invisible: layout !== 'target' }]"></i>
                                Target only
                            </button>
                        </li>
                    </ul>
                </li>
                 <li class="p-0 position-relative submenu-parent">
                    <button class="dropdown-item small" @click.stop>Theme<i class="bi bi-chevron-right float-end"></i></button>
                    <ul class="dropdown-menu submenu position-absolute top-0 start-100 p-1">
                        <li class="p-0">
                            <button class="dropdown-item small" @click="setTheme('system')">
                                <i :class="['bi bi-check-lg me-1', { invisible: themeMode !== 'system' }]"></i>
                                System
                            </button>
                        </li>
                        <li class="p-0">
                            <button class="dropdown-item small" @click="setTheme('light')">
                                <i :class="['bi bi-check-lg me-1', { invisible: themeMode !== 'light' }]"></i>
                                Light
                            </button>
                        </li>
                        <li class="p-0">
                            <button class="dropdown-item small" @click="setTheme('dark')">
                                <i :class="['bi bi-check-lg me-1', { invisible: themeMode !== 'dark' }]"></i>
                                Dark
                            </button>
                        </li>
                    </ul>
                </li> 
                <li class="p-0 position-relative submenu-parent">
                    <button class="dropdown-item small" @click.stop>Appearance<i class="bi bi-chevron-right float-end"></i></button>
                    <ul class="dropdown-menu submenu position-absolute top-0 start-100 p-1">
                        <li class="p-0">
                        <button class="dropdown-item small d-flex justify-content-between align-items-center gap-3" @click="zoomIn">
                            <span>Zoom in</span>
                            <span class="text-muted small">Ctrl++</span>
                        </button>
                        </li>
                        <li class="p-0">
                            <button class="dropdown-item small d-flex justify-content-between align-items-center gap-3" @click="zoomOut">
                                <span>Zoom out</span>
                                <span class="text-muted small">Ctrl+-</span>
                            </button>
                        </li>
                        <li class="p-0">
                            <button class="dropdown-item small d-flex justify-content-between align-items-center gap-3" @click="reset">
                                <span>Reset</span>
                                <span class="text-muted small">Ctrl+0</span>
                            </button>
                        </li>
                    </ul>
                </li>
                <li class="p-0 position-relative submenu-parent">
                    <button class="dropdown-item small" @click.stop>Map View<i class="bi bi-chevron-right float-end"></i></button>
                    <ul class="dropdown-menu submenu position-absolute top-0 start-100 p-1">
                        <li class="p-0">
                            <button class="dropdown-item small" @click="mapView = 'force'">
                                <i :class="['bi bi-check-lg me-1', { invisible: mapView !== 'force' }]"></i>
                                Topological
                            </button>
                        </li>
                        <li class="p-0">
                            <button class="dropdown-item small" @click="mapView = 'geo'">
                                <i :class="['bi bi-check-lg me-1', { invisible: mapView !== 'geo' }]"></i>
                                Geospatial
                            </button>
                        </li>
                    </ul>
                </li> 
            </ul>
            </li>
            <li class="nav-item dropdown me-2 small">
                <a class="nav-link text-body" data-bs-toggle="dropdown">Help</a>
                <ul class="dropdown-menu p-1">
                    <li class="p-0">
                        <button class="dropdown-item small">Something</button>
                    </li>
                </ul>
            </li>
        </ul>
    </div> 
</template>

<script setup lang="ts">
    import { useFileUpload } from "../composables/useFileUpload";
    import { useZoom } from "../composables/useZoom";
    import { useMenuBar } from "../composables/useMenuBar";
import { usePlanStore } from "../stores/usePlanStore";

    const { zoomIn, zoomOut, reset } = useZoom()
    const { instanceFile, planFileInput, instanceFileInput, handleFileChange, openFile } = useFileUpload();
    const { navRef, layout, themeMode, mapView, setTheme } = useMenuBar();
    const planStore = usePlanStore();
</script>

<style scoped>
    .nav-pills .nav-item .nav-link:hover,
    .nav-pills .nav-item .nav-link.active {
        background-color: var(--nav-pills-background-color);
        color: inherit;
    }
    .dropdown-item:active {
        background-color: var(--bs-primary) !important;
    }
    .submenu-parent:hover > .dropdown-menu {
        display: block;
    }
    .dropdown-menu {
        width: 200px;
    }
</style>