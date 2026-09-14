<template>
    <div class="vh-100 d-flex flex-column overflow-hidden">
        <Toast/>
        <MenuBar/>
        <Maps />
        <PanelResizeHandle @mousedown="startDrag" />
        <Panel class="panel" :style="{ height: panelHeight + 'vh' }" />
    </div>
</template>

<script setup lang="ts">
    import Maps from './components/Maps.vue';
    import MenuBar from './components/MenuBar.vue';
    import Panel from './components/Panel.vue';
    import Toast from './components/Toast.vue';
    import PanelResizeHandle from './components/PanelResizeHandle.vue';
    import { useResizablePanel } from './composables/useResizablePanel';
    import { useTheme } from './composables/useTheme';

    useTheme()
    const { panelHeight, startDrag } = useResizablePanel()

</script>

<style scoped>
</style>