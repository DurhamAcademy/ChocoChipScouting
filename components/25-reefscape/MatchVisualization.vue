<script setup lang="ts">
import Sentiment from 'sentiment';
import BarChart from '../charts/BarChart.vue';
import { promptedNoteOptions } from '~/utils/promptedNoteOptions';

let sentiment = new Sentiment();
let options = {
  extras: {
    mid: -2,
    pretty: 0,
    broke: -3.5,
    disabled: -3.5,
    quickly: 2,
    easily: 2,
    dog: -3,
  },
};

const props = defineProps<{
  rowData: any;
}>();

const selectedMatch = ref(1);

props.rowData.rawData.sort(compareMatchNumbers);

function compareMatchNumbers(a: any, b: any) {
  //TODO this is a bad solution to a typing problem
  let matchA =
    typeof a.matchNumber == 'string' ? parseInt(a.matchNumber) : a.matchNumber;
  let matchB =
    typeof b.matchNumber == 'string' ? parseInt(b.matchNumber) : b.matchNumber;
  if (matchA < matchB) {
    return -1;
  }
  if (matchA > matchB) {
    return 1;
  }
  return 0;
}

const chartLabels = [
  'Auto Coral L1',
  'Auto Coral L2',
  'Auto Coral L3',
  'Auto Coral L4',
  'Coral L1',
  'Coral L2',
  'Coral L3',
  'Coral L4',
  'Net',
  'Net Miss',
  'Processor',
  'Processor Miss',
];
let currData: any = ref(props.rowData.rawData[selectedMatch.value - 1]);

watch(selectedMatch, () => {
  currData.value = props.rowData.rawData[selectedMatch.value - 1];
  chartData.value = [
    currData.value.auto.coralL1,
    currData.value.auto.coralL2,
    currData.value.auto.coralL3,
    currData.value.auto.coralL4,
    currData.value.teleop.coralL1,
    currData.value.teleop.coralL2,
    currData.value.teleop.coralL3,
    currData.value.teleop.coralL4,
    currData.value.teleop.net,
    currData.value.teleop.netMiss,
    currData.value.teleop.processor,
    currData.value.teleop.processorMiss,
  ];
  chartTitle.value = 'Match ' + currData.value.matchNumber;
  sentimentScore = sentiment.analyze(
    props.rowData.rawData[selectedMatch.value - 1].notes.notes,
  ).score;
});

let sentimentScore = sentiment.analyze(
  props.rowData.rawData[selectedMatch.value - 1].notes.notes,
).score;

let chartData = ref([
  currData.value.auto.coralL1,
  currData.value.auto.coralL2,
  currData.value.auto.coralL3,
  currData.value.auto.coralL4,
  currData.value.teleop.coralL1,
  currData.value.teleop.coralL2,
  currData.value.teleop.coralL3,
  currData.value.teleop.coralL4,
  currData.value.teleop.net,
  currData.value.teleop.netMiss,
  currData.value.teleop.processor,
  currData.value.teleop.processorMiss,
]);
let chartTitle = ref('Match ' + currData.value.matchNumber);

let promptedNotesOptions = promptedNoteOptions.map(option => option.name);
let promptedNotesDetailedOptions = promptedNoteOptions.map(
  option => option.summaries,
);
</script>

<template>
  <UCard>
    <div class="flex flex-wrap">
      <BarChart
        class="mb-1 w-1/3 max-w-1/3"
        :labels="chartLabels"
        :data="chartData"
        :chart-title="chartTitle"
        height="h-80"
        width="w-80"
      ></BarChart>
      <div class="flex-auto whitespace-normal max-h-72 max-w-1/2 w-1/2 ml-4">
        <p class="font-extrabold text-sm dark:text-white mt-1">
          Auto & Endgame:
        </p>
        <div class="pb-1">
          <UBadge
            color="sky"
            variant="subtle"
            v-if="rowData.rawData[selectedMatch - 1].auto.mobility"
            class="mr-1.5 mt-2"
            >Mobility</UBadge
          >
          <UBadge
            color="indigo"
            variant="subtle"
            v-for="endgame in rowData.rawData[selectedMatch - 1].endgame
              .endgame"
            class="mr-1.5 mt-2"
          >
            {{ endgame }}
          </UBadge>
        </div>
        <div
          class="text-wrap max-w-full w-full h-2/3 max-h-2/3 overflow-y-scroll dark:text-primary overflow-x-hidden mt-1"
        >
          <div
            v-for="(item, index) in rowData.rawData[selectedMatch - 1].notes
              .promptedNotes"
          >
            <div v-if="item.selected">
              <div class="pb-1">
                <span class="font-extrabold mr-2 text-sm dark:text-white">{{
                  promptedNotesOptions[index] + ':'
                }}</span>
                <UBadge
                  :color="
                    item.rating > 3 ? 'green' : item.rating < 3 ? 'red' : 'gray'
                  "
                  :variant="
                    item.rating == 2 || item.rating == 4 ? 'soft' : 'subtle'
                  "
                  >{{ item.rating }}</UBadge
                >
              </div>
              <div v-for="(text, i) in item.notes">
                <p
                  v-if="text != ''"
                  class="text-xs pb-0 font-semibold underline-offset-2 dark:text-white"
                >
                  {{ promptedNotesDetailedOptions[index][i] + ':' }}
                </p>
                <p
                  v-if="text != ''"
                  class="pb-2.5 text-xs dark:text-white"
                >
                  {{ text }}
                </p>
              </div>
            </div>
          </div>
          <div v-if="rowData.rawData[selectedMatch - 1].notes.notes != ''">
            <span class="font-extrabold text-sm dark:text-white"
              >Other notes:
            </span>
            <UBadge
              :color="
                sentimentScore > 1
                  ? 'green'
                  : sentimentScore < -1
                    ? 'red'
                    : 'gray'
              "
              :variant="
                sentimentScore < 1 && sentimentScore > -1 ? 'soft' : 'subtle'
              "
              >{{ sentimentScore }}</UBadge
            >
            <p class="pb-2 text-xs dark:text-white">
              {{
                rowData.rawData[selectedMatch - 1].notes.notes == ''
                  ? 'None'
                  : rowData.rawData[selectedMatch - 1].notes.notes
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <UPagination
        v-model="selectedMatch"
        :total="rowData.rawData.length"
        show-last
        show-first
        :page-count="1"
        :max="7"
        :active-button="{ variant: 'outline' }"
        :inactive-button="{ color: 'gray' }"
      />
    </template>
  </UCard>
</template>
