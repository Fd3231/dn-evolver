<template>
    <div class="mt-3 tabs flex-shrink-0">
        <button v-for="tab in tabs" :key="tab" @click="activeTab = tab; searchTerm = ''"
            :class="['btn me-2', activeTab === tab ? 'btn-primary' : 'btn-ghost']">
        {{ tab }}
        </button>
        <div class="d-inline-block search-bar float-end w-25 text-center">
            <input type="text" class="form-control" placeholder="Type to search" v-model="searchTerm">
        </div>
    </div>
    <!--Substations-->
    <div class="table-container overflow-y-auto mt-3 flex-grow-1" v-if="activeTab === 'Substations'">
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>Substation</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody class="table-group-divider">
                <tr v-for="substation in filteredSubstations()">
                <td>{{ substation.id }}</td>
                <td>{{ substation.type }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <!--Lines-->
    <div class="table-container overflow-y-auto mt-3 flex-grow-1" v-if="activeTab === 'Lines'">
        <table class="table table-bordered">
            <thead >
                <tr>
                    <th>Line</th>
                    <th>Source</th>
                    <th>Target</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Length</th>
                </tr>
            </thead>
            <tbody class="table-group-divider">
                <tr v-for="line in filteredLines()">
                <td>{{ line.id }}</td>
                <td>{{ line.source }}</td>
                <td>{{ line.target }}</td>
                <td>{{ line.status }}</td>
                <td>{{ line.type }}</td>
                <td>{{ line.length }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
    import { useNetworkPanel } from "../composables/useNetworkPanel";

    const { tabs, activeTab, searchTerm, hasNetwork, filteredSubstations, filteredLines } = useNetworkPanel();
</script>

<style scoped>
    .panel {
        border: 1px solid var(--map--background-color);
    }
</style>