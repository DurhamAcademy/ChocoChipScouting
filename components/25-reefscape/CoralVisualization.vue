<script setup lang="ts">
import LineChart from '~/components/charts/LineChart.vue';

const props = defineProps<{
  rowData: any;
}>();

props.rowData.rawData.sort(compareMatchNumbers);
// compares the Match Numbers
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
// assigning variables
let matchScores = ref<Array<number>>([]);
let coralL1 = ref<Array<number>>([]);
let coralL2 = ref<Array<number>>([]);
let coralL3 = ref<Array<number>>([]);
let coralL4 = ref<Array<number>>([]);
let matchNums = ref<Array<number>>([]);

for (let match of props.rowData.rawData) {
  matchNums.value.push(match.matchNumber);
  coralL2.value.push(match.auto.coralL2 + match.teleop.coralL2);
  matchScores.value.push(
    match.teleop.net +
      match.auto.net +
      match.auto.processor +
      match.teleop.processor || 0,
  );
  //TODO backwards compatability
  coralL4.value.push(match.auto.coralL4 + match.teleop.coralL4);
  coralL3.value.push(match.auto.coralL3 + match.teleop.coralL3);
  coralL1.value.push(match.auto.coralL1 + match.teleop.coralL1);
}

const chartTitles = ['L1', 'L2', 'L3', 'L4'];

let columns = [
  {
    key: 'period',
    label: '',
  },
  {
    key: 'l1',
    label: 'L1',
  },
  {
    key: 'l2',
    label: 'L2',
  },
  {
    key: 'l3',
    label: 'L3',
  },
  {
    key: 'l4',
    label: 'L4',
  },
];
let columns2 = [
  {
    key: 'period',
    label: '',
  },
  {
    key: 'l1',
    label: 'L1',
  },
  {
    key: 'l2',
    label: 'L2',
  },
  {
    key: 'l3',
    label: 'L3',
  },
  {
    key: 'l4',
    label: 'L4',
  }
];

function getCoralStats() {
  let totalAutoL1 = 0;
  let totalAutoL2 = 0;
  let totalAutoL3 = 0;
  let totalAutoL4 = 0;
  let minAutoL1 = null;
  let minAutoL2 = null;
  let minAutoL3 = null;
  let minAutoL4 = null;
  let maxAutoL1 = null;
  let maxAutoL2 = null;
  let maxAutoL3 = null;
  let maxAutoL4 = null;
  let totalTeleopL1 = 0;
  let totalTeleopL2 = 0;
  let totalTeleopL3 = 0;
  let totalTeleopL4 = 0;
  let minTeleopL1 = null;
  let minTeleopL2 = null;
  let minTeleopL3 = null;
  let minTeleopL4 = null;
  let maxTeleopL1 = null;
  let maxTeleopL2 = null;
  let maxTeleopL3 = null;
  let maxTeleopL4 = null;
  for (let match of props.rowData.rawData) {
    let matchAutoL1 = match.auto.coralL1;
    let matchAutoL2 = match.auto.coralL2;
    let matchAutoL3 = match.auto.coralL3;
    let matchAutoL4 = match.auto.coralL4;
    let matchTeleopL1 = match.teleop.coralL1;
    let matchTeleopL2 = match.teleop.coralL2;
    let matchTeleopL3 = match.teleop.coralL3;
    let matchTeleopL4 = match.teleop.coralL4;

    if (matchAutoL1 > maxAutoL1) maxAutoL1 = matchAutoL1;
    if (matchAutoL2 > maxAutoL2) maxAutoL2 = matchAutoL2;
    if (matchAutoL3 > maxAutoL3) maxAutoL3 = matchAutoL3;
    if (matchAutoL4 > maxAutoL4) maxAutoL4 = matchAutoL4;
    if (matchTeleopL1 > maxTeleopL1) maxTeleopL1 = matchTeleopL1;
    if (matchTeleopL2 > maxTeleopL2) maxTeleopL2 = matchTeleopL2;
    if (matchTeleopL3 > maxTeleopL3) maxTeleopL3 = matchTeleopL3;
    if (matchTeleopL4 > maxTeleopL4) maxTeleopL4 = matchTeleopL4;

    if (minAutoL1 == null || minAutoL1 > matchAutoL1) minAutoL1 = matchAutoL1;
    if (minAutoL2 == null || minAutoL2 > matchAutoL2) minAutoL2 = matchAutoL2;
    if (minAutoL3 == null || minAutoL3 > matchAutoL3) minAutoL3 = matchAutoL3;
    if (minAutoL4 == null || minAutoL4 > matchAutoL4) minAutoL4 = matchAutoL4;
    if (minTeleopL1 == null || minTeleopL1 > matchTeleopL1) minTeleopL1 = matchTeleopL1;
    if (minTeleopL2 == null || minTeleopL2 > matchTeleopL2) minTeleopL2 = matchTeleopL2;
    if (minTeleopL3 == null || minTeleopL3 > matchTeleopL3) minTeleopL3 = matchTeleopL3;
    if (minTeleopL4 == null || minTeleopL4 > matchTeleopL4) minTeleopL4 = matchTeleopL4;
    totalAutoL1 += matchAutoL1;
    totalAutoL2 += matchAutoL2;
    totalAutoL3 += matchAutoL3;
    totalAutoL4 += matchAutoL4;
    totalTeleopL1 += matchTeleopL1;
    totalTeleopL2 += matchTeleopL2;
    totalTeleopL3 += matchTeleopL3;
    totalTeleopL4 += matchTeleopL4;
  }
  return [
    minAutoL1,//6
    minAutoL2,//7
    minAutoL3,//8
    minAutoL4,//9
    maxAutoL1,//10
    maxAutoL2,//11
    maxAutoL3,//12
    maxAutoL4,//13
    totalAutoL1 / props.rowData.rawData.length,//14
    totalAutoL2 / props.rowData.rawData.length,//15
    totalAutoL3 / props.rowData.rawData.length,//16
    totalAutoL4 / props.rowData.rawData.length, //17
    minTeleopL1,//18
    minTeleopL2,//19
    minTeleopL3,//20
    minTeleopL4,//21
    maxTeleopL1,//22
    maxTeleopL2,//23
    maxTeleopL3,//24
    maxTeleopL4,//25
    totalTeleopL1 / props.rowData.rawData.length,//26
    totalTeleopL2 / props.rowData.rawData.length,//27
    totalTeleopL3 / props.rowData.rawData.length,//28
    totalTeleopL4 / props.rowData.rawData.length, //29
  ];
}
console.log(getCoralStats());
let coralStats = getCoralStats().map(value => value?.toFixed?.(2));
let rows = [
  {
    period: 'Min',
    l1: coralStats[0],
    l2: coralStats[1],
    l3: coralStats[2],
    l4: coralStats[3],
  },
  {
    period: 'Max',
    l1: coralStats[4],
    l2: coralStats[5],
    l3: coralStats[6],
    l4: coralStats[7],
  },
  {
    period: 'Avg',
    l1: coralStats[8],
    l2: coralStats[9],
    l3: coralStats[10],
    l4: coralStats[11],
  },
];
let rows2 = [
  {
    period: 'Min',
    l1: coralStats[12],
    l2: coralStats[13],
    l3: coralStats[14],
    l4: coralStats[15],
  },
  {
    period: 'Max',
    l1: coralStats[16],
    l2: coralStats[17],
    l3: coralStats[18],
    l4: coralStats[19],
  },
  {
    period: 'Avg',
    l1: coralStats[20],
    l2: coralStats[21],
    l3: coralStats[22],
    l4: coralStats[23],
  },
];
</script>

<template>

  <UCard>
    <div
      class="font-semibold underline underline-offset-2 mb-1 w-full text-center text-lg"
    >
      <h1>Coral</h1>
    </div>
    <div class="flex-auto flex flex-wrap">
      <LineChart
        class="mr-5"
        :data="[coralL1, coralL2, coralL3, coralL4]"
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
          <h1>Auto</h1>
        </div>
        <UTable
          :rows="rows"
          :columns="columns"
        />
        <div
          class="font-semibold underline underline-offset-2 mb-1 w-full text-center"
        >
          <h1>Teleop</h1>
        </div>
        <UTable
          :rows="rows2"
          :columns="columns2"
        />
      </div>
    </div>
  </UCard>
</template>
