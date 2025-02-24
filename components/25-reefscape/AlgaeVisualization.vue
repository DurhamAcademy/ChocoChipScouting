<script setup lang="ts">
import LineChart from '~/components/charts/LineChart.vue';

const props = defineProps<{
  rowData: any;
}>();

props.rowData.rawData.sort(compareMatchNumbers);

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
  netScores.value.push(match.auto.net + match.teleop.net || 0);
  processorScores.value.push(
    match.auto.processor + match.teleop.processor || 0,
  );
  matchScores.value.push(
    match.teleop.net +
      match.auto.net +
      match.auto.processor +
      match.teleop.processor || 0,
  );
}

const chartTitles = ['Net', 'Processor', 'Total'];

let columns = [
  {
    key: 'period',
    label: 'Game Period',
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
  let maxAuto = 0;
  let minAuto = null;
  let totalAuto = 0;

  let maxTeleop = 0;
  let minTeleop = null;
  let totalTeleop = 0;
  for (let match of props.rowData.rawData) {
    if (match.auto.processor + match.auto.net > maxAuto)
      maxAuto = match.auto.processor + match.auto.net;
    if (match.teleop.processor + match.auto.net > maxTeleop)
      maxTeleop = match.teleop.processor + match.teleop.net;

    if (minAuto == null || minAuto > match.auto.processor + match.auto.net)
      minAuto = match.auto.processor + match.auto.net;
    if (
      minTeleop == null ||
      minTeleop > match.teleop.processor + match.teleop.net
    )
      minTeleop = match.teleop.processor + match.teleop.net;

    totalAuto += match.auto.processor + match.auto.net;
    totalTeleop += match.teleop.processor + match.teleop.net;
  }
  return [
    minAuto,
    maxAuto,
    totalAuto / props.rowData.rawData.length,
    minTeleop,
    maxTeleop,
    totalTeleop / props.rowData.rawData.length,
  ];
}
let algaeStats = getAlgaeStats().map(value => value?.toFixed?.(2));

let rows = [
  {
    period: 'Processor',
    min: algaeStats[0],
    max: algaeStats[1],
    avg: algaeStats[2],
  },
  {
    period: 'Net',
    min: algaeStats[3],
    max: algaeStats[4],
    avg: algaeStats[5],
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
        <div class="font-semibold w-full text-center">
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
