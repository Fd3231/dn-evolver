<template>
    <div class="row ms-2 me-2 mb-1 maps">
        <div v-show="showStart" class="col-12 col-lg">
            <NetworkMap type="start"/>
        </div>
        <div v-show="showTarget" class="col-12 col-lg">
            <NetworkMap type="end"/>
        </div>
    </div>
</template>

<script setup lang="ts">
    import NetworkMap from './NetworkMap.vue';
    import { useMaps } from '../composables/useMaps';

    const { showStart, showTarget } = useMaps();

</script>

<style scoped>
.maps {
    flex:1;
    min-height: 0;
    overflow: auto;
}
</style>