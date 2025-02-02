<script setup lang="ts">
import databases, { type ScoutingData } from '~/utils/databases';
import IdMeta = PouchDB.Core.IdMeta;
import OuterComponents from '~/components/website-utils/OuterComponents.vue';
import { useLazyAsyncData } from '#app';
import { useEventKey } from '~/composables/useEventKey';

//gets scouting data
const { scoutingData: db } = databases.locals;

//fetches the current event from useEventKey compostable
const currentEvent = useEventKey();

//asynchronously runs setup function
const { pending, data: res } = await useLazyAsyncData('res', () => setup());

watch(currentEvent, () => {
  useLazyAsyncData('res', () => setup());
});

//sets how the table sorts match values
const sortBy = ref([
  { key: 'teamNumber', order: 'asc' },
  { key: 'matchNumber', order: 'asc' },
]);

/*
  TODO update seasonally
  Sets the fields to be displayed
  documentation on how to use vuetify tables => https://vuetifyjs.com/en/components/data-tables/basics/
  likely keep info tab the same and work from there
 */
const headers = [
  {
    title: 'Info',
    align: 'center',
    children: [
      { title: 'Team', align: 'start', value: 'teamNumber' },
      { title: 'Match', align: 'start', value: 'matchNumber' },
      { title: 'Notes', value: 'notes' },
      { title: 'Author', value: 'author' },
    ],
  },
  {
    title: 'Auto',
    align: 'center',
    children: [
      { title: 'Coral L1', align: 'end', value: 'auto.coralL1' },
      { title: 'Coral L2', align: 'end', value: 'auto.coralL2' },
      { title: 'Coral L3', align: 'end', value: 'auto.coralL3' },
      { title: 'Coral L4', align: 'end', value: 'auto.coralL4' },
      { title: 'Algae in Processor', align: 'end', value: 'auto.processor' },
    ],
  },
  {
    title: 'Tele-op',
    align: 'center',
    children: [
      { title: 'Coral L1', align: 'end', value: 'teleop.coralL1' },
      { title: 'Coral L2', align: 'end', value: 'teleop.coralL2' },
      { title: 'Coral L3', align: 'end', value: 'teleop.coralL3' },
      { title: 'Coral L4', align: 'end', value: 'teleop.coralL4' },
      { title: 'Algae in Processor', align: 'end', value: 'teleop.processor' },
    ],
  },
  {
    title: 'Endgame',
    align: 'center',
    children: [
      { title: 'Climb', align: 'end', value: 'endgame.endgame' },
    ],
  },
];

//sets up the data for the table
let items: Array<ScoutingData & IdMeta> = [];

async function setup() {
  //gets all documents from the database asynchronously
  const allDocs = (await db.allDocs()).rows;
  let promiseMatches = allDocs.map(
    async (doc): Promise<ScoutingData & IdMeta> => {
      return await db.get(doc.id);
    },
  );
  let matches = await Promise.all(promiseMatches);
  console.log(matches);
  //filters data to ensure all data is usable and of the current event
  matches = matches.filter(function (match) {
    return !(
      match.matchNumber === -1 ||
      match.matchNumber === null ||
      match.event != currentEvent.value
    );
  });
  console.log(matches);
  items = matches;
}

let promptedNoteTitles = ["Coral", "Algae", "Driver"]
</script>
<template>
  <OuterComponents>
    <VDataTable
      :loading="pending"
      class="max-h-dvh overflow-auto dark:bg-gray-800 dark:text-white"
      :headers="headers"
      :items="items"
      item-key="name"
      density="compact"
      :items-per-page="-1"
      v-model:sort-by="sortBy"
    >
      <template v-slot:item.notes="row">
        <UPopover :popper="{ offsetDistance: 15 }">
          <UButton
            class="mt-2 mb-2 dark:bg-slate-700"
            color="coral"
            label="Notes"
            variant="soft"
            @click="console.dir(row.value.promptedNotes[0])"
          />
          <template #panel>
            <UContainer
              class="m-auto max-w-lg min-w-[15rem] overflow-y-auto border-2 dark:border-primary rounded-lg"
              style="max-height: 20rem; min-height: 10rem"
            >
              <br/>
                <div v-for="(promptedNote, index) in row.value.promptedNotes">
                  <p v-if="promptedNote.notes.length > 0"> <b>{{promptedNoteTitles[index]}}</b> </p>
                  <p v-else><del> </del></p>
                  <p v-for="note in promptedNote.notes">{{note}}</p> <br>
                </div>
              <div>
                <p v-if="row.value.notes.length > 0"> <b>Other</b><br>{{row.value.notes}}</p>
                <p v-else><del> </del></p>
                <br>
              </div>


            </UContainer>
          </template>
        </UPopover>
      </template>
      <template v-slot:item.author="row">
        <UBadge
          :label="row.value.replace(/[0-9]/g, '') || '-'"
          color="gray"
          variant="soft"
        />
      </template>

      <template v-slot:loading>
        <v-skeleton-loader type="table-row"></v-skeleton-loader>
      </template>
    </VDataTable>
  </OuterComponents>
</template>
<style scoped>
.v-data-table :deep(th) {
  font-weight: 600 !important;
}
.v-data-table :deep(td) {
  color: gray;
}
</style>
