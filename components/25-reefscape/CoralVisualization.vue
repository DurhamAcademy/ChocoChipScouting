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
  const numLevels = 4;
  const totalAuto = Array(numLevels).fill(0);
  const totalTeleop = Array(numLevels).fill(0);
  const minAuto = Array(numLevels).fill(null);
  const maxAuto = Array(numLevels).fill(null);
  const minTeleop = Array(numLevels).fill(null);
  const maxTeleop = Array(numLevels).fill(null);
  const minL = Array(numLevels).fill(null);
  const maxL = Array(numLevels).fill(null);

  for (let match of props.rowData.rawData) {
    for (let i = 0; i < numLevels; i++) {
      const autoVal = match.auto[`coralL${i + 1}`];
      const teleopVal = match.teleop[`coralL${i + 1}`];

      // Update totals
      totalAuto[i] += autoVal;
      totalTeleop[i] += teleopVal;

      // Update min/max for auto
      //minAuto[i] = minAuto[i] === null ? autoVal : Math.min(minAuto[i], autoVal);
      //maxAuto[i] = maxAuto[i] === null ? autoVal : Math.max(maxAuto[i], autoVal);

      // Update min/max for teleop
      //minTeleop[i] = minTeleop[i] === null ? teleopVal : Math.min(minTeleop[i], teleopVal);
      //maxTeleop[i] = maxTeleop[i] === null ? teleopVal : Math.max(maxTeleop[i], teleopVal);

      // Update min/max for total levels
      const totalMin = autoVal + teleopVal;
      const totalMax = autoVal + teleopVal;
      if (totalMax > maxL[i] || maxL == null) maxAuto[i] = autoVal, maxTeleop[i] = teleopVal;
      if(totalMin < minL[i]|| minL == null) minAuto[i] = autoVal, minTeleop[i] = teleopVal;
      minL[i] = minL[i] === null ? totalMin : Math.min(minL[i], totalMin);
      maxL[i] = maxL[i] === null ? totalMax : Math.max(maxL[i], totalMax);
    }
  }

  const numMatches = props.rowData.rawData.length;
  const totalL = totalAuto.map((val, i) => totalTeleop[i] + val);

  return [
    ...minAuto, // 0-3
    ...maxAuto, // 4-7
    ...totalAuto.map(val => val / numMatches), // 8-11
    ...minTeleop, // 12-15
    ...maxTeleop, // 16-19
    ...totalTeleop.map(val => val / numMatches), // 20-23
    ...totalL.map(val => val / numMatches / 2), // 24-27
    ...minL, // 28-31
    ...maxL // 32-35
  ];
}


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

  <UCard class="w-auto h-auto">

    <div class="flex-auto flex flex-wrap">
      <LineChart
        class="m-auto my-11"
        :data="[coralL1, coralL2, coralL3, coralL4]"
        :labels="matchNums"
        :chart-titles="chartTitles"
        :suggested-max="20"
        height="h-100"
        width="w-100"
      ></LineChart>
      <div class="flex-auto whitespace-normal">
        <div
        class="font-semibold underline underline-offset-2 mb-1 w-full text-center text-lg my-11"
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