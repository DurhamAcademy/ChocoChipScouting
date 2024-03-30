<script setup lang="ts">
import databases, {type ScoutingData} from "~/utils/databases"
import {eventOptions} from "~/utils/eventOptions";
import IdMeta = PouchDB.Core.IdMeta;
import {useLazyAsyncData} from "#app";
const { scoutingData } = databases.locals

const sortBy = ref([{ key: 'teamNumber', order: 'asc' }, { key: 'matchNumber', order: 'asc' }])

let currentEvent = eventOptions[0]
if (typeof window !== 'undefined') currentEvent = localStorage.getItem('currentEvent') || eventOptions[0]

let db = scoutingData

async function setup(){
  const allDocs = (await db.allDocs()).rows
  let promiseMatches = allDocs.map(async (doc): Promise<ScoutingData & IdMeta> => {
    return await db.get(doc.id)
  })
  let matches = await Promise.all(promiseMatches)
  for (let i=matches.length-1; i>=0; i--) {
    if(matches[i].matchNumber === -1 || matches[i].matchNumber === null || (matches[i].event != currentEvent)){
      matches.splice(i, 1)
    }
  }




  items = matches
}
let items

const headers = [
  {
    title: 'Info',
    align: 'center',
    children: [
      { title: 'Team', align: 'start', value: 'teamNumber' },
      { title: 'Match', align: 'start', value: 'matchNumber' },
      { title: 'Notes', value: 'notes' },
      { title: 'Author', value: 'author' },
    ]
  }, {
    title: 'Auto',
    align: 'center',
    children: [
      { title: 'Amp', align: 'end', value: 'auto.amp' },
      { title: 'Speaker', align: 'end', value: 'auto.speakerNA' },
      { title: 'Missed Amp', align: 'end', value: 'auto.missedAmp' },
      { title: 'Missed Speaker', align: 'end', value: 'auto.missedSpeaker' },
      { title: 'Mobility', align: 'end', value: 'auto.mobility' }
    ]
  }, {
    title: 'Tele-op',
    align: 'center',
    children: [
      { title: 'Amp', align: 'end', value: 'teleop.amp' },
      { title: 'Speaker', align: 'end', value: 'teleop.speakerNA' },
      { title: 'Missed Amp', align: 'end', value: 'teleop.missedAmp' },
      { title: 'Missed Speaker', align: 'end', value: 'teleop.missedSpeaker' },
    ]
  }, {
    title: 'Endgame',
    align: 'center',
    children: [
      {title: 'Onstage', align: 'end', value: 'endgame.endgame'},
      {title: 'Trap', align: 'end', value: 'endgame.trap'}
    ]
  }
]

const { pending, data: res } = await useLazyAsyncData('res', () => setup())
</script>
<template>
  <OuterComponents>
    <VDataTable
        :loading="pending"
        class="max-h-dvh overflow-auto"
        :headers="headers"
        :items="items"
        item-key="name"
        density="compact"
        :items-per-page="-1"
        v-model:sort-by="sortBy"
    >
      <template v-slot:item.notes="row">
        <UPopover :popper="{ offsetDistance: 15 }">
          <UButton class="mt-2 mb-2" color="yellow" label="Notes" variant="soft"/>
          <template #panel>
              <UContainer class="m-auto max-w-lg min-w-[15rem] overflow-y-auto" style="max-height: 20rem; min-height: 10rem">
                <br>
                <div class="whitespace-normal break-all"> Notes: {{row.value.notes}}</div>
                <br>
                <p v-if="row.value.playedDefense"> Defense: {{ row.value.defense }}</p>
              </UContainer>
          </template>
        </UPopover>
      </template>
      <template v-slot:item.author="row">
        <UTooltip :text="row.value || 'not found'">
          <UAvatar
              class="select-none"
              :alt="row.value.replace(/[0-9]/g, '') || '-'"
          />
        </UTooltip>
      </template>

      <template v-slot:loading>
        <v-skeleton-loader type="table-row"></v-skeleton-loader>
      </template>
    </VDataTable>
  </OuterComponents>
</template>
<style scoped>
.v-data-table ::v-deep th {
  font-weight: 600 !important;
}
.v-data-table ::v-deep td {
  color: gray;
}
</style>
