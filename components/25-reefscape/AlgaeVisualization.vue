<script setup lang="ts">
import LineChart from '~/components/charts/LineChart.vue';

const props = defineProps<{
  rowData: any;
}>();

console.dir(props.rowData.rawData)
props.rowData.rawData.sort(compareMatchNumbers);
console.dir(props.rowData.rawData)

function compareMatchNumbers(a: any, b: any) {
  //TODO i hate this work around rly need to fix this
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

let matchNums = ref<Array<number>>([]);
let matchScores = ref<Array<number>>([]);
let processorScores = ref<Array<number>>([]);
let netScores = ref<Array<number>>([]);

for (let match of props.rowData.rawData) {
  matchNums.value.push(match.matchNumber);
  //TODO backwards compatability
  netScores.value.push(match.teleop.net || 0);
  processorScores.value.push(match.teleop.processor || 0,);
  matchScores.value.push(
    (match.teleop.net +
      match.teleop.processor) || 0,
  );
}

const chartTitles = ['Net', 'Processor', 'Total'];

let columns = [
  {
    key: 'period',
    label: 'Type',
  },
  {
    key: 'min',
    label: 'Min',
  },
  {
    key: 'max',
    label: 'Max',
  },
  {
    key: 'avg',
    label: 'Avg',
  },
];

function getAlgaeStats() {
  let maxProcessor = 0;
  let minProcessor = null;
  let totalProcessor = 0;

  let maxNet = 0;
  let minNet = null;
  let totalNet = 0;
  for (let match of props.rowData.rawData) {
    if (match.teleop.processor > maxProcessor)
      maxProcessor = match.teleop.processor;
    if (match.teleop.net > maxNet)
      maxNet = match.teleop.net;

    if (minProcessor == null || minProcessor > match.auto.processor)
      minProcessor = match.auto.processor;
    if (minNet == null || minNet > match.teleop.processor + match.teleop.net)
      minNet = match.teleop.net;

    totalProcessor += match.teleop.processor;
    totalNet += match.teleop.net;
  }
  return [
    minProcessor || 0,
    maxProcessor || 0,
    (totalProcessor / props.rowData.rawData.length) || 0,
    minNet || 0,
    maxNet || 0,
    (totalNet / props.rowData.rawData.length) || 0,
  ];
}
let algaeStats = getAlgaeStats().map(value => value?.toFixed?.(2));

let rows = [
  {
    period: 'Processor',
    min: algaeStats[0] || 0,
    max: algaeStats[1] || 0,
    avg: algaeStats[2] || 0,
  },
  {
    period: 'Net',
    min: algaeStats[3] || 0,
    max: algaeStats[4] || 0,
    avg: algaeStats[5] || 0,
  },
];
</script>

<template>
  <UCard>
    <div class="flex flex-auto width=device-width flex-wrap">
      <LineChart
        class="mr-5"
        :data="[netScores, processorScores, matchScores]"
        :labels="matchNums"
        :chart-titles="chartTitles"
        :suggested-max="20"
        height="h-64"
        width="w-64"
      ></LineChart>
      <div class="flex-auto whitespace-normal">
        <div class="font-semibold w-full text-center dark:text-white">
          <h1>Algae</h1>
        </div>
        <UTable
          :rows="rows"
          :columns="columns"
        />
      </div>
    </div>
  </UCard>
</template>
