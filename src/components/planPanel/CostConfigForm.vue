<template>
    <div v-if="hasPlan" ref="dropdownToggle" class="btn btn-ghost rounded d-inline-flex align-items-center px-3 py-2 shadow-sm gap-3 cost-dropdown" data-bs-toggle="dropdown">
        <p class="mb-0 text-nowrap">Plan cost:</p>
        <p class="mb-0 text-nowrap fw-bold">{{ totalCost }}</p>
        <i class="bi bi-chevron-down"></i>
    </div>
    <ul class="dropdown-menu p-2 w-auto" @click.stop>
        <li class="px-2 py-1">
            <div class="row align-items-center g-2">
                <div class="col-7">
                    <label class="text-muted small mb-0">Cost to add a line</label>
                </div>
                <div class="col-5">
                    <input v-model.number="form.add" type="number" min="0" placeholder="0" class="form-control form-control-sm text-end" id="costAdd">
                </div>
            </div>
        </li>
        <li class="px-2 py-1">
            <div class="row align-items-center g-2">
                <div class="col-7">
                    <label class="text-muted small mb-0">Cost to remove a line</label>
                </div>
                <div class="col-5">
                    <input v-model.number="form.remove" type="number" min="0" placeholder="0" class="form-control form-control-sm text-end" id="costAdd">
                </div>
            </div>
        </li>
        <li class="px-2 py-1">
            <div class="row align-items-center g-2">
                <div class="col-7">
                    <label class="text-muted small mb-0">Cost to switch a line</label>
                </div>
                <div class="col-5">
                    <input v-model.number="form.switch" type="number" min="0" placeholder="0" class="form-control form-control-sm text-end" id="costAdd">
                </div>
            </div>
        </li>
        <li class="px-2 py-1">
            <div class="row align-items-center g-2">
                <div class="col-7">
                    <label class="text-muted small mb-0">Fixed cost</label>
                </div>
                <div class="col-5">
                    <input v-model.number="form.fixed" type="number" min="0" placeholder="0" class="form-control form-control-sm text-end" id="costAdd">
                </div>
            </div>
        </li>
        <li class="d-flex gap-2 px-2 pt-2">
            <button class="btn btn-sm btn-primary w-100" :disabled="isUnchanged || !isValid" @click="save">Save</button>
            <button class="btn btn-sm btn-outline-danger w-100" @click="reset">Reset</button>
        </li>
    </ul>

</template>

<script setup lang="ts">
    import { useCostConfig } from '../../composables/plan/useCostConfig';

    const { form, isUnchanged, isValid, totalCost, dropdownToggle, hasPlan, save, reset } = useCostConfig();
</script>

<style scoped>
    .form-floating .form-control { height: 2.8rem; min-height: 2.8rem; }
    .form-floating label { font-size: 0.9rem; padding-top: 0.6rem; }
    .cost-dropdown { cursor: pointer; }
</style>