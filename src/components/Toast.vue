<template>
    <div v-if="toast" class="toast-container position-fixed p-3" :class="positionClasses[toast.position]">
        <div id="appToast" class="toast border-0" role="alert">
            <div class="d-flex" :class="`text-bg-${toast.type}`">
                <div class="toast-body">{{ toast.message }}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useToast } from '../composables/useToast';
    const { toast, positionClasses } = useToast();
</script>