<template>
    <div class="panel-root w-100 ps-4 pe-4 pt-2 shadow-lg overflow-hidden d-flex flex-column">
        <ul class="nav nav-underline">
            <li class="nav-item me-2">
                <div class="nav-link text-body" :class="{ active: activeTab === 'network' }" @click="activeTab = 'network'">Network</div>
            </li>
            <li class="nav-item">
                <div class="nav-link text-body" :class="{ active: activeTab === 'plan' }" @click="activeTab = 'plan'">Plan</div>
            </li>
        </ul>
        <NetworkPanel v-if="activeTab === 'network'" />
        <PlanPanel v-if="activeTab === 'plan'" />
    </div>
</template>

<script setup lang="ts">
    import { usePanel } from '../composables/usePanel';
    import NetworkPanel from './NetworkPanel.vue';
    import PlanPanel from './planPanel/PlanPanel.vue';
   
   const { activeTab } = usePanel();
</script>

<style>
.nav-link {
    cursor: pointer;
}
</style>