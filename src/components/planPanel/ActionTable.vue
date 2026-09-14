<template>
    <div class="cont rounded d-flex flex-column flex-fill">
        <div class="mb-2 flex-shrink-0 d-flex flex-row">
            <button v-if="!isAdding && selectedRows.size === 0" class="btn btn-sm btn-primary me-2 ps-2 pe-3" @click="isAdding = true">
                <i class="bi bi-plus-lg me-2"></i>New action
            </button>
            <template v-if="selectedRows.size > 0">
                <button class="btn btn-sm btn-outline-danger px-4 me-2" :disabled="selectedRows.size === 0" @click="removeAction">Remove</button>
                <div class="dropdown">
                <button 
                    class="btn btn-sm btn-outline-primary px-3 me-2" 
                    data-bs-toggle="dropdown"
                    title="Move to next step">
                    <i class="bi bi-reply-fill flip-x"></i>
                </button>
                <ul class="dropdown-menu w-auto dropdown-menu-scrollable">
                    <li v-for="step in availableSteps" :key="step" class="dropdown-item" @click="moveToStep(step)">
                        {{ step }}
                    </li>
                </ul>
                </div>
            </template>
            <template v-if="isAdding && selectedRows.size === 0">
                <button class="btn btn-sm btn-primary px-4 me-2" @click="confirmAdd">Confirm</button>
                <button class="btn btn-sm btn-secondary px-4 me-2" @click="cancelAdd">Cancel</button>
                <div class="d-flex flex-row ms-2">
                    <select v-model="newAction.name" class="form-select form-select-sm w-auto me-2">
                        <option value="">-- Select action --</option>
                        <option v-for="opt in actionOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>

                    <select v-model="newAction.lines[0]" class="form-select form-select-sm w-auto me-2">
                        <option value="">-- Select line --</option>
                        <template v-if="newAction.name === ACTION.ADD">
                            <option v-for="opt in buildableLines" :key="opt.id" :value="opt.id">{{ opt.id }}</option>
                        </template>
                        <template v-else-if="newAction.name === ACTION.REMOVE">
                            <option v-for="opt in removableLines" :key="opt.id" :value="opt.id">{{ opt.id }}</option>
                        </template>
                        <template v-else-if="newAction.name === ACTION.SWITCH">
                            <option v-for="opt in switchableLines" :key="opt.id" :value="opt.id">{{ opt.id }}</option>
                        </template>
                    </select>
                    <select v-if="newAction.name === ACTION.SWITCH && newAction.lines[0]" v-model="newAction.lines[1]" class="form-select form-select-sm w-auto">
                        <option value="">-- Select line --</option>
                        <option v-for="opt in adjacentLines(newAction.lines[0])" :key="opt.id" :value="opt.id">{{ opt.id }}</option>
                    </select>
                </div>
                <div v-if="newAction.name === ACTION.ADD" class="form-text ms-1">
                    <i class="bi bi-info-circle"></i> You can only add buildable lines.
                </div>
                <div v-else-if="newAction.name === ACTION.REMOVE" class="form-text ms-1">
                   <i class="bi bi-info-circle"></i> You can only remove removable lines.
                </div>
            </template>

        </div>
        <div class="table-container overflow-y-auto flex-fill">
            <table class="table">
                <thead>
                    <tr class="text-center">
                        <th class="checkbox"><input class="form-check-input" type="checkbox"
                            :checked="selectedRows.size === currentStepActions.length"
                            :disabled="currentStepActions.length === 0"
                            @change="toggleSelectionAll()">
                        </th>
                        <th>Action</th>
                        <th>Line(s)</th>
                        <th>Cost</th>
                    </tr>
                </thead>
                <tbody class="table-group-divider">
                    <tr v-for="(action, index) in currentStepActions" :key="index" class="text-center">
                        <td class="checkbox">
                            <input class="form-check-input" type="checkbox"
                                :value="index"
                                :checked="selectedRows.has(index)"
                                @change="toggleSelection(index)">
                        </td>
                        <td>{{ action.name }}</td>
                        <td v-if="action.name===ACTION.SWITCH">{{ formatSwitchAction(action.params) }}</td>
                        <td v-else>{{ action.params.join('-') }}</td>
                        <td>
                            <template v-if="editing === action">
                                <input
                                class="costInput ms-4 p-0 text-center"
                                type="number"
                                v-model.number="editingCost"
                                @input="editingCost = Math.min(maxActionCost, Math.max(0, editingCost))"
                                @keyup.enter="updateActionCost(index)"
                                />
                                <i class="bi bi-check-lg float-end pe-3 editing" @click="updateActionCost(index)"></i>
                            </template>
                            <template v-else>
                                <span class="ps-4">{{ formatCurrency(action.cost) }}</span>
                                <i class="bi bi-pencil-fill float-end pe-3 editing" @click="startEditingCost(action)"></i>
                            </template>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr class="text-center">
                        <td colspan="3" class="text-end fw-semibold">Total</td>
                        <td class="fw-semibold">{{ formatCurrency(currentStepCost) }}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useActionBuilder } from '../../composables/plan/useActionBuilder';
    import { ACTION } from '../../types';
    import { formatCurrency } from '../../utils/utils';

    const {
        selectedRows, isAdding, newAction, actionOptions,
        currentStepActions, currentStepCost, availableSteps,
        buildableLines, removableLines, switchableLines,
        editing, maxActionCost, editingCost,
        confirmAdd, cancelAdd, removeAction, toggleSelection,
        toggleSelectionAll, adjacentLines, moveToStep, formatSwitchAction,
        updateActionCost, startEditingCost
    } = useActionBuilder();
</script>

<style scoped>
    table { table-layout: fixed; }
    .checkbox { width: 2%; }
    .form-check-input { cursor: pointer; }
    .cont {
        padding: 0.5rem;
        min-height: 0;
    }
    .flip-x {
        display: inline-block;
        transform: scaleX(-1);
    }
    .dropdown-menu-scrollable {
        max-height: 200px;
        overflow-y: auto;
    }   
    .editing {cursor: pointer; color: grey; }
    .bi-check-lg { font-size: larger; }
    .costInput {
        outline: none;
        box-shadow: none;
        border: 0.5px solid rgb(221, 223, 221);
    }
</style>