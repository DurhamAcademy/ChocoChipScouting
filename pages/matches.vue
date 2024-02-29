<script setup lang="ts">
import databases from "~/utils/databases"
import {eventOptions} from "~/utils/eventOptions";
const { scoutingData } = databases.locals

const sortBy = ref([{ key: 'teamNumber', order: 'asc' }])

let currentEvent = eventOptions[0]
if (typeof window !== 'undefined') currentEvent = localStorage.getItem('currentEvent') || eventOptions[0]

let db = scoutingData


const matche = (await db.allDocs()).rows
let matc = matche.map(async (doc) => {
  return await db.get(doc.id)
})
let matches = await Promise.all(matc)
for (let i=matches.length-1; i>=0; i--) {
  if(matches[i].matchNumber === -1 || matches[i].matchNumber === null || (matches[i].event != currentEvent)){
    matches.splice(i, 1)
  }
}

const headers = [
  {
    title: 'Info',
    align: 'center',
    children: [
      { title: 'Team', align: 'start', value: 'teamNumber' },
      { title: 'Match', align: 'start', value: 'matchNumber' },
      { title: 'Notes', value: 'notes' }
    ]
  }, {
    title: 'Auto',
    align: 'center',
    children: [
      { title: 'Amp', align: 'end', value: 'auto.amp' },
      { title: 'Speaker', align: 'end', value: 'auto.speakerNA' },
      { title: 'Mobility', align: 'end', value: 'auto.mobility' }
    ]
  }, {
    title: 'Tele-op',
    align: 'center',
    children: [
      { title: 'Amp', align: 'end', value: 'teleop.amp' },
      { title: 'Speaker', align: 'end', value: 'teleop.speakerNA' },
      { title: 'Speaker+', align: 'end', value: 'teleop.speakerA' }
    ]
  }, {
    title: 'Endgame',
    align: 'center',
    children: [
      { title: 'Onstage', align: 'end', value: 'endgame.endgame' },
      { title: 'Trap', align: 'end', value: 'endgame.trap' }
    ]
  }
]


const items = matches

</script>
<template>
  <OuterComponents>
    <VDataTable
        class="max-h-dvh overflow-auto"
        :headers="headers"
        :items="items"
        item-key="name"
        density="compact"
        items-per-page="10"
        v-model:sort-by="sortBy"
    >
      <template v-slot:item.notes="row">
        <UPopover :popper="{ offsetDistance: 15 }">
          <UButton class="-m-2.5" color="yellow" label="Notes" variant="soft"/>
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
