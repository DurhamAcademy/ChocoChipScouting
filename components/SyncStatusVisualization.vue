<script setup lang="ts">
import {useSync} from "~/composables/useSync";

let syncDatabasesState = useSync();

const columns = [{
  key: 'dbName',
  label: 'Name'
}, {
  key: 'human',
  label: 'Current Status'
}, {
  key: 'id',
  label: 'Status ID'
}];
</script>

<template>
  <UTable :rows="syncDatabasesState" :columns="columns"/>
</template>

<style scoped>

</style>