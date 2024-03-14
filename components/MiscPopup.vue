<script setup lang="ts">

const props = defineProps<{
  rowData: any,
}>()

</script>

<template>
  <UCard>
    <div class="flex flex-auto width=device-width flex-wrap">
      <div class="flex-auto width=devicewidth whitespace-normal break-all overflow-y-scroll mr-5">
        <div class="text-center mb-1">
          <p class="font-bold text-slate-900">Extra Notes</p>
        </div>
        <div v-for="note of rowData.extraNotes">
          <p class="font-semibold">Note {{rowData.extraNotes.indexOf(note) + 1}}:</p>
          <p class="mb-4">{{note}}</p>
        </div>
        <div v-if="rowData.extraNotes.length == 0" class="mt-2 text-center">
          <p>There are no extra notes for this team :(</p>
        </div>
      </div>
      <div class="flex-auto w-72">
      </div>
    </div>
  </UCard>
</template>

<style scoped>

</style>