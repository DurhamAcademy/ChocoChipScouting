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
let autoMatchScores = ref<Array<number>>([]);
let matchScores = ref<Array<number>>([]);
let missedScores = ref<Array<number>>([]);

for (let match of props.rowData.rawData) {
  matchNums.value.push(match.matchNumber);
  autoMatchScores.value.push(match.auto.coralNA);
  //TODO backwards compatability
  missedScores.value.push(
    match.auto.missedCoral + match.teleop.missedCoral || 0,
  );
  matchScores.value.push(match.auto.coralNA + match.teleop.coralNA);
}

const chartTitles = ['Total', 'Auto', 'Missed'];

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

function getCoralStats() {
  let maxAuto = 0;
  let minAuto = null;
  let totalAuto = 0;

  let maxTeleop = 0;
  let minTeleop = null;
  let totalTeleop = 0;
  for (let match of props.rowData.rawData) {
    let matchAuto = match.auto.coralNA;
    let matchTeleop = match.teleop.coralNA;
    if (matchAuto > maxAuto) maxAuto = matchAuto;
    if (matchTeleop > maxTeleop) maxTeleop = matchTeleop;

    if (minAuto == null || minAuto > matchAuto) minAuto = matchAuto;
    if (minTeleop == null || minTeleop > matchTeleop) minTeleop = matchTeleop;

    totalAuto += matchAuto;
    totalTeleop += matchTeleop;
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
console.log(getCoralStats());
let coralStats = getCoralStats().map(value => value.toFixed(2));

let rows = [
  {
    period: 'Auto',
    min: coralStats[0],
    max: coralStats[1],
    avg: coralStats[2],
  },
  {
    period: 'Teleop',
    min: coralStats[3],
    max: coralStats[4],
    avg: coralStats[5],
  },
];
</script>

<template>
  <UCard>
    <div class="width=device-width flex-auto flex flex-wrap">
      <LineChart
        class="mr-5"
        :data="[matchScores, autoMatchScores, missedScores]"
        :labels="matchNums"
        :chart-titles="chartTitles"
        :suggested-max="20"
        height="h-64"
        width="w-64"
      ></LineChart>
      <div class="flex-auto whitespace-normal">
        <div
          class="font-semibold underline underline-offset-2 mb-1 w-full text-center"
        >
          <h1>Coral</h1>
        </div>
        <UTable :rows="rows" :columns="columns" />
      </div>
    </div>
  </UCard>
</template>
