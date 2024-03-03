<script setup lang="ts">

import PouchDB from "pouchdb";
import databases from "~/utils/databases";

let syncDisable = ref(false)

async function sync(){
  syncDisable.value = true
  await PouchDB.sync(databases.locals.scoutingData, databases.remotes.scoutingData)
  await PouchDB.sync(databases.locals.basic, databases.remotes.basic)
  await PouchDB.sync(databases.locals.attachments, databases.remotes.attachments)
  syncDisable.value = false
}
</script>


<template>
  <OuterComponents>
    <UButton class="ml-3 mt-3" @click="sync" :disabled="syncDisable" :loading="syncDisable">
      Sync Databases
    </UButton>
    <div class="px-5 max-w-2xl min-w-lg flex-grow">
      <LazyUSkeleton class="w-full h-64 my-5"></LazyUSkeleton>
      <LazyUCard class="my-5">
        <div class="m-1 flex flex-wrap">
          <div class="w-1/2 pr-2.5">
            <LazyUSkeleton class="w-full h-32"></LazyUSkeleton>
          </div>
          <div class="w-1/2 pl-2.5">
            <LazyUSkeleton class="w-full h-32"></LazyUSkeleton>
          </div>
          <div class="w-full py-2.5">
            <LazyUSkeleton class="w-full h-16"></LazyUSkeleton>
          </div>
        </div>
      </LazyUCard>
    </div>
  </OuterComponents>
</template>

<style scoped>
.app-button-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>