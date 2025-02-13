<script setup lang="ts">
import LineChart from '~/components/charts/LineChart.vue'
import {useMouse, useWindowScroll } from '@vueuse/core';

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
  coralL2.value.push(match.auto.coralL2 + match.teleop.coralL2);
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
    id: 'row',
  },
  {
    key: 'l2',
    label: 'L2',
    id: 'row'
  },
  {
    key: 'l3',
    label: 'L3',
    id: 'row',
  },
  {
    key: 'l4',
    label: 'L4',
    id: 'row',
  },
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
  let totalL1 = 0;
  let totalL2 = 0;
  let totalL3 = 0;
  let totalL4 = 0;
  let minL1 = null;
  let minL2 = null;
  let minL3 = null;
  let minL4 = null;
  let maxL1 = null;
  let maxL2 = null;
  let maxL3 = null;
  let maxL4 = null;
  for (let match of props.rowData.rawData) {
    if (match.auto.coralL1 > maxAutoL1) maxAutoL1 = match.auto.coralL1;
    if (match.auto.coralL2 > maxAutoL2) maxAutoL2 = match.auto.coralL2;
    if (match.auto.coralL3 > maxAutoL3) maxAutoL3 = match.auto.coralL3;
    if (match.auto.coralL4 > maxAutoL4) maxAutoL4 = match.auto.coralL4;
    if (match.teleop.coralL1 > maxTeleopL1) maxTeleopL1 = match.teleop.coralL1;
    if (match.teleop.coralL2 > maxTeleopL2) maxTeleopL2 = match.teleop.coralL2;
    if (match.teleop.coralL3 > maxTeleopL3) maxTeleopL3 = match.teleop.coralL3;
    if (match.teleop.coralL4 > maxTeleopL4) maxTeleopL4 = match.teleop.coralL4;
    if (minAutoL1 == null || minAutoL1 > match.auto.coralL1) minAutoL1 = match.auto.coralL1;
    if (minAutoL2 == null || minAutoL2 > match.auto.coralL2) minAutoL2 = match.auto.coralL2;
    if (minAutoL3 == null || minAutoL3 > match.auto.coralL3) minAutoL3 = match.auto.coralL3;
    if (minAutoL4 == null || minAutoL4 > match.auto.coralL4) minAutoL4 = match.auto.coralL4;
    if (minTeleopL1 == null || minTeleopL1 > match.teleop.coralL1) minTeleopL1 = match.teleop.coralL1;
    if (minTeleopL2 == null || minTeleopL2 > match.teleop.coralL2) minTeleopL2 = match.teleop.coralL2;
    if (minTeleopL3 == null || minTeleopL3 > match.teleop.coralL3) minTeleopL3 = match.teleop.coralL3;
    if (minTeleopL4 == null || minTeleopL4 > match.teleop.coralL4) minTeleopL4 = match.teleop.coralL4;
    if (minTeleopL1 > minAutoL1) minL1 = minAutoL1;
    if (minTeleopL1 < minAutoL1) minL1 = minTeleopL1;
    if (minTeleopL2 > minAutoL2) minL2 = minAutoL2;
    if (minTeleopL2 < minAutoL2) minL2 = minTeleopL2;
    if (minTeleopL3 > minAutoL3) minL3 = minAutoL3;
    if (minTeleopL3 < minAutoL3) minL3 = minTeleopL3;
    if (minTeleopL4 > minAutoL4) minL4 = minAutoL4;
    if (minTeleopL4 < minAutoL4) minL4 = minTeleopL4;
    if (maxTeleopL1 > maxAutoL1) maxL1 = maxTeleopL1;
    if (maxTeleopL1 < maxAutoL1) maxL1 = maxAutoL1;
    if (maxTeleopL2 > maxAutoL2) maxL2 = maxTeleopL2;
    if (maxTeleopL2 < maxAutoL2) maxL2 = maxAutoL2;
    if (maxTeleopL3 > maxAutoL3) maxL3 = maxTeleopL3;
    if (maxTeleopL3 < maxAutoL3) maxL3 = maxAutoL3;
    if (maxTeleopL4 > maxAutoL4) maxL4 = maxTeleopL4;
    if (maxTeleopL4 < maxAutoL3) maxL4 = maxAutoL4;

    totalAutoL1 += match.auto.coralL1;
    totalAutoL2 += match.auto.coralL2;
    totalAutoL3 += match.auto.coralL3;
    totalAutoL4 += match.auto.coralL4;
    totalTeleopL1 += match.teleop.coralL1;
    totalTeleopL2 += match.teleop.coralL2;
    totalTeleopL3 += match.teleop.coralL3;
    totalTeleopL4 += match.teleop.coralL4;
    totalL1 = totalTeleopL1 + totalAutoL1;
    totalL2 = totalTeleopL2 + totalAutoL2;
    totalL3 = totalTeleopL3 + totalAutoL3;
    totalL4 = totalTeleopL4 + totalAutoL4;
  }
  return [
    minAutoL1,//0
    minAutoL2,//1
    minAutoL3,//2
    minAutoL4,//3
    maxAutoL1,//4
    maxAutoL2,//5
    maxAutoL3,//6
    maxAutoL4,//7
    totalAutoL1 / props.rowData.rawData.length,//8
    totalAutoL2 / props.rowData.rawData.length,//9
    totalAutoL3 / props.rowData.rawData.length,//10
    totalAutoL4 / props.rowData.rawData.length,//11
    minTeleopL1,//12
    minTeleopL2,//13
    minTeleopL3,//14
    minTeleopL4,//15
    maxTeleopL1,//16
    maxTeleopL2,//17
    maxTeleopL3,//18
    maxTeleopL4,//19
    totalTeleopL1 / props.rowData.rawData.length,//20
    totalTeleopL2 / props.rowData.rawData.length,//21
    totalTeleopL3 /props.rowData.rawData.length,//22
    totalTeleopL4 /props.rowData.rawData.length,//23
    totalL1 / props.rowData.rawData.length  /2,//24
    totalL2 / props.rowData.rawData.length  /2,//25
    totalL3  / props.rowData.rawData.length /2,//26
    totalL4 / props.rowData.rawData.length  /2, //27
    minL1,//28
    minL2,//29
    minL3,//30
    minL4,//31
    maxL1,//32
    maxL2,//33
    maxL3,//34
    maxL4,//35
  ];
}
console.log(getCoralStats());
let coralStats = getCoralStats().map(value => value?.toFixed?.(2));
let rows = [
  {
    period: 'Min',
    l1: coralStats[28],
    l1popup:[coralStats[0], coralStats[12]],
    l2: coralStats[29],
    l2popup:[coralStats[1], coralStats[13]],
    l3: coralStats[30],
    l3popup:[coralStats[2], coralStats[14]],
    l4: coralStats[31],
    l4popup:[coralStats[3], coralStats[15]],
    row:"0",
  },
  {
    period: 'Max',
    l1: coralStats[32],
    l1popup:[coralStats[4], coralStats[16]],
    l2: coralStats[33],
    l2popup:[coralStats[5], coralStats[17]],
    l3: coralStats[34],
    l3popup:[coralStats[6], coralStats[18]],
    l4: coralStats[35],
    l4popup:[coralStats[7], coralStats[19]],
    row:"1",
  },
  {
    period: 'Avg',
    l1: coralStats[24],
    l1popup:[coralStats[8], coralStats[20]],
    l2: coralStats[25],
    l2popup:[coralStats[9], coralStats[21]],
    l3: coralStats[26],
    l3popup:[coralStats[10], coralStats[22]],
    l4: coralStats[27],
    l4popup:[coralStats[11], coralStats[23]],
    row:"2",
  },
];

</script>

<template>

  <UCard class="w-2/3">

    <div class="flex-auto flex flex-wrap">
      <LineChart
        class="m-auto"
        :data="[coralL1, coralL2, coralL3, coralL4]"
        :labels="matchNums"
        :chart-titles="chartTitles"
        :suggested-max="20"
        height="h-81"
        width="w-81"
      ></LineChart>
      <div class="flex-auto whitespace-normal">
        <div
        class="font-semibold underline underline-offset-2 mb-1 w-full text-center text-lg"
      >
        <h1>Coral</h1>
      </div>
        <UTable :rows="rows" :columns="columns">
              <template #l1-data="{ row, column }">
                <UPopover mode="hover">
                  <p>{{row.l1}}</p>
                  <template #panel>
                    <div class="p-2">
                      Auto: {{rows[row.row].l1popup[0]}}
                      Teleop: {{rows[row.row].l1popup[1]}}
                    </div>
                  </template>
                </UPopover>
              </template>
          <template #l2-data="{row, column}">
            <UPopover mode="hover">
              <p>{{row.l2}}</p>
              <template #panel>
                <div class="p-2">
                  Auto: {{rows[row.row].l2popup[0]}}
                  Teleop: {{rows[row.row].l2popup[1]}}
                </div>
              </template>
            </UPopover>
          </template>
          <template #l3-data="{ row, column }">
            <UPopover mode="hover" >
              <p>{{row.l3}}</p>
              <template #panel>
                <div class="p-2">
                  Auto: {{rows[row.row].l3popup[0]}}
                  Teleop: {{rows[row.row].l3popup[1]}}
                </div>
              </template>
            </UPopover>
          </template>
          <template #l4-data="{ row, column }">
            <UPopover mode="hover">
              <p>{{row.l4}}</p>
              <template #panel>
                <div class="p-2">
                Auto: {{rows[row.row].l4popup[0]}}
                  Teleop: {{rows[row.row].l4popup[1]}}
                </div>
              </template>
            </UPopover>
          </template>
        </UTable>
      </div>
    </div>
  </UCard>
</template>