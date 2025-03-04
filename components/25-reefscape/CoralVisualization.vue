<script setup lang="ts">
import LineChart from '~/components/charts/LineChart.vue';
import { useMouse, useWindowScroll } from '@vueuse/core';

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
    id: 'row',
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

  // Initialize placeholders for min, max, and total values
  const stats = {
    auto: {
      min: Array(numLevels).fill(null),
      max: Array(numLevels).fill(null),
      total: Array(numLevels).fill(0), // Accumulate values to calculate average later
    },
    teleop: {
      min: Array(numLevels).fill(null),
      max: Array(numLevels).fill(null),
      total: Array(numLevels).fill(0),
    },
    combined: {
      min: Array(numLevels).fill(null), // Combined auto + teleop
      max: Array(numLevels).fill(null),
      total: Array(numLevels).fill(0),
    },
  };

  // Loop through matches and update the stats
  for (let match of props.rowData.rawData) {
    for (let i = 0; i < numLevels; i++) {
      const autoVal = match.auto[`coralL${i + 1}`];
      const teleopVal = match.teleop[`coralL${i + 1}`];
      const totalVal = autoVal + teleopVal;

      // Update totals
      stats.auto.total[i] += autoVal;
      stats.teleop.total[i] += teleopVal;
      stats.combined.total[i] += totalVal;

      // Update min/max for auto
      stats.auto.min[i] =
        stats.auto.min[i] === null
          ? autoVal
          : Math.min(stats.auto.min[i], autoVal);
      stats.auto.max[i] =
        stats.auto.max[i] === null
          ? autoVal
          : Math.max(stats.auto.max[i], autoVal);

      // Update min/max for teleop
      stats.teleop.min[i] =
        stats.teleop.min[i] === null
          ? teleopVal
          : Math.min(stats.teleop.min[i], teleopVal);
      stats.teleop.max[i] =
        stats.teleop.max[i] === null
          ? teleopVal
          : Math.max(stats.teleop.max[i], teleopVal);

      // Update min/max for combined (auto + teleop)
      stats.combined.min[i] =
        stats.combined.min[i] === null
          ? totalVal
          : Math.min(stats.combined.min[i], totalVal);
      stats.combined.max[i] =
        stats.combined.max[i] === null
          ? totalVal
          : Math.max(stats.combined.max[i], totalVal);
    }
  }

  // Calculate averages based on the number of matches
  const numMatches = props.rowData.rawData.length;
  const averages = {
    auto: stats.auto.total.map(total => total / numMatches),
    teleop: stats.teleop.total.map(total => total / numMatches),
    combined: stats.combined.total.map(total => total / numMatches),
  };

  return {
    min: {
      auto: stats.auto.min.map(val => val.toFixed(2)),
      teleop: stats.teleop.min.map(val => val.toFixed(2)),
      combined: stats.combined.min.map(val => val.toFixed(2)),
    },
    max: {
      auto: stats.auto.max.map(val => val.toFixed(2)),
      teleop: stats.teleop.max.map(val => val.toFixed(2)),
      combined: stats.combined.max.map(val => val.toFixed(2)),
    },
    average: {
      auto: averages.auto.map(val => val.toFixed(2)),
      teleop: averages.teleop.map(val => val.toFixed(2)),
      combined: averages.combined.map(val => val.toFixed(2)),
    },
  };
}

let coralStats = getCoralStats();
let rows = [
  {
    period: 'Min',
    l1: coralStats.min.combined[0],
    l1popup: [coralStats.min.auto[0], coralStats.min.teleop[0]],
    l2: coralStats.min.combined[1],
    l2popup: [coralStats.min.auto[1], coralStats.min.teleop[1]],
    l3: coralStats.min.combined[2],
    l3popup: [coralStats.min.auto[2], coralStats.min.teleop[2]],
    l4: coralStats.min.combined[3],
    l4popup: [coralStats.min.auto[3], coralStats.min.teleop[3]],
    row: '0',
  },
  {
    period: 'Max',
    l1: coralStats.max.combined[0],
    l1popup: [coralStats.max.auto[0], coralStats.max.teleop[0]],
    l2: coralStats.max.combined[1],
    l2popup: [coralStats.max.auto[1], coralStats.max.teleop[1]],
    l3: coralStats.max.combined[2],
    l3popup: [coralStats.max.auto[2], coralStats.max.teleop[2]],
    l4: coralStats.max.combined[3],
    l4popup: [coralStats.max.auto[3], coralStats.max.teleop[3]],
    row: '1',
  },
  {
    period: 'Avg',
    l1: coralStats.average.combined[0],
    l1popup: [coralStats.average.auto[0], coralStats.average.teleop[0]],
    l2: coralStats.average.combined[1],
    l2popup: [coralStats.average.auto[1], coralStats.average.teleop[1]],
    l3: coralStats.average.combined[2],
    l3popup: [coralStats.average.auto[2], coralStats.average.teleop[2]],
    l4: coralStats.average.combined[3],
    l4popup: [coralStats.average.auto[3], coralStats.average.teleop[3]],
    row: '2',
  },
];
</script>

<template>
  <UCard class="w-auto h-auto">
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
        <div class="font-semibold w-full dark:text-primary text-center text-lg">
          <h1>Coral</h1>
        </div>
        <UTable
          :rows="rows"
          :columns="columns"
        >
          <template #l1-data="{ row, column }">
            <UPopover mode="hover">
              <p>{{ row.l1 }}</p>
              <template #panel>
                <div class="p-2">
                  Auto: {{ rows[row.row].l1popup[0] }} Teleop:
                  {{ rows[row.row].l1popup[1] }}
                </div>
              </template>
            </UPopover>
          </template>
          <template #l2-data="{ row, column }">
            <UPopover mode="hover">
              <p>{{ row.l2 }}</p>
              <template #panel>
                <div class="p-2">
                  Auto: {{ rows[row.row].l2popup[0] }} Teleop:
                  {{ rows[row.row].l2popup[1] }}
                </div>
              </template>
            </UPopover>
          </template>
          <template #l3-data="{ row, column }">
            <UPopover mode="hover">
              <p>{{ row.l3 }}</p>
              <template #panel>
                <div class="p-2">
                  Auto: {{ rows[row.row].l3popup[0] }} Teleop:
                  {{ rows[row.row].l3popup[1] }}
                </div>
              </template>
            </UPopover>
          </template>
          <template #l4-data="{ row, column }">
            <UPopover mode="hover">
              <p>{{ row.l4 }}</p>
              <template #panel>
                <div class="p-2">
                  Auto: {{ rows[row.row].l4popup[0] }} Teleop:
                  {{ rows[row.row].l4popup[1] }}
                </div>
              </template>
            </UPopover>
          </template>
        </UTable>
      </div>
    </div>
  </UCard>
</template>
