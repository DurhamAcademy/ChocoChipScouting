<script setup lang="ts">
import databases from "~/utils/databases"
import {eventOptions} from "~/utils/eventOptions";
const { scoutingData } = databases.locals

const sortBy = ref([{ key: 'teamNumber', order: 'asc' }])

const currentEvent = localStorage.getItem('currentEvent') || eventOptions[0]

let db = scoutingData

let test = ref("")

const matche = (await db.allDocs()).rows
let matc = matche.map(async (doc) => {
  return await db.get(doc.id)
})
let matches = await Promise.all(matc)
for (let i=matches.length-1; i>=0; i--) {
  if(matches[i].matchNumber === -1 || matches[i].matchNumber === null || (matches[i].event != currentEvent)) matches.splice(i, 1)
  test.value = matches[i].event
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
        :headers="headers"
        :items="items"
        item-key="name"
        density="compact"
        items-per-page="5"
        v-model:sort-by="sortBy"
    >
      <template v-slot:item.notes="row">
        <UPopover>
          <UButton class="-m-2.5" color="yellow" label="Notes" variant="soft"/>
          <template #panel>
            <UCard>
              <div class="max-w-lg min-w-[15rem] overflow-y-auto" style="max-height: 20rem; min-height: 10rem">
                <div class="whitespace-normal break-all">{{row.notes.notes}}</div>
                <p>Reliability:{{ row.notes.reliability }}</p>
                <p>Efficiency:{{ row.notes.efficiency }}</p>
              </div>
            </UCard>
          </template>
        </UPopover>
      </template>
    </VDataTable>
    <p>{{test}}</p>
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