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
      { title: 'Amp', align: 'end', value: 'auto.amp' },
      { title: 'Missed Amp', align: 'end', value: 'auto.missedAmp' },
      { title: 'Speaker', align: 'end', value: 'auto.speakerNA' },
      { title: 'Missed Speaker', align: 'end', value: 'auto.missedSpeaker' },
      { title: 'Position', align: 'start', value: 'auto.position' },
      { title: 'Mobility', align: 'end', value: 'auto.mobility' },
    ],
  },
  {
    title: 'Tele-op',
    align: 'center',
    children: [
      { title: 'Amp', align: 'end', value: 'teleop.amp' },
      { title: 'Missed Amp', align: 'end', value: 'teleop.missedAmp' },
      { title: 'Speaker', align: 'end', value: 'teleop.speakerNA' },
      { title: 'Missed Speaker', align: 'end', value: 'teleop.missedSpeaker' },
    ],
  },
  {
    title: 'Endgame',
    align: 'center',
    children: [
      { title: 'Onstage', align: 'end', value: 'endgame.endgame' },
      { title: 'Trap', align: 'end', value: 'endgame.trap' },
    ],
  },
];

//sets up the data for the table
let items;

async function setup() {
  //gets all documents from the database asynchronously
  const allDocs = (await db.allDocs()).rows;
  let promiseMatches = allDocs.map(
    async (doc): Promise<ScoutingData & IdMeta> => {
      return await db.get(doc.id);
    },
  );
  let matches = await Promise.all(promiseMatches);
  //filters data to ensure all data is usable and of the current event
  matches = matches.filter(function (match) {
    return !(
      match.matchNumber === -1 ||
      match.matchNumber === null ||
      match.event != currentEvent.value
    );
  });
  items = matches;
}
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
          <UButton
            class="mt-2 mb-2"
            color="yellow"
            label="Notes"
            variant="soft"
          />
          <template #panel>
            <UContainer
              class="m-auto max-w-lg min-w-[15rem] overflow-y-auto"
              style="max-height: 20rem; min-height: 10rem"
            >
              <br />
              <div class="whitespace-normal break-all">
                Notes: {{ row.value.notes }}
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
.v-data-table ::v-deep th {
  font-weight: 600 !important;
}
.v-data-table ::v-deep td {
  color: gray;
}
</style>
