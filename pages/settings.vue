<script setup lang="ts">

import SyncStatusVisualization from "~/components/SyncStatusVisualization.vue";
import {ref} from "vue";
import PouchDB from "pouchdb";
import databases from "~/utils/databases";
let syncDisable = ref(false)

async function sync(){
  syncDisable.value = true
  await PouchDB.sync(databases.locals.scoutingData, databases.remotes.scoutingData)
  await PouchDB.sync(databases.locals.basic, databases.remotes.basic)
  await PouchDB.sync(databases.locals.attachments, databases.remotes.attachments)
  await PouchDB.sync(databases.locals.teamInfo, databases.remotes.teamInfo)
  syncDisable.value = false
}

const colorMode = useColorMode()
const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})
</script>

<template>
  <OuterComponents>
    <UButton class="ml-3 mt-3" @click="sync" :disabled="syncDisable" :loading="syncDisable">
      Sync Databases
    </UButton>
    <div class="flex justify-center">
      <UCard class="max-w-xl mt-5 flex-grow">
        <UFormGroup class="inline-block inputDiv mb-2" label="Style">
          <ClientOnly>
            <UButton
                :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
                color="gray"
                variant="ghost"
                label="Theme"
                @click="isDark = !isDark"
            />
          </ClientOnly>
        </UFormGroup>
        <UFormGroup class="inline-block inputDiv mb-2 ml-6" label="Databases">
          <UButton
              :disabled="syncDisable"
              :loading="syncDisable"
              :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
              color="gray"
              variant="ghost"
              label="Sync"
              @click="sync"
          />
        </UFormGroup>
        <UAccordion
            variant="soft"
            size="sm"
            :items="[{ label: 'Debug Menu', slot: 'debug'}]"
        >
          <template #debug>
            <SyncStatusVisualization/>
          </template>
        </UAccordion>
      </UCard>
    </div>
  </OuterComponents>
</template>

<style scoped>

</style>