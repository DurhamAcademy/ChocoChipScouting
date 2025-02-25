<script setup lang="ts">
import SpiderGraph from '~/components/charts/SpiderGraph.vue';
import { min } from '@popperjs/core/lib/utils/math';
import BarChart from '~/components/charts/BarChart.vue';
const props = defineProps<{
  teamData: any;
  maxScores: any;
}>();

let autoPoints = 0;
let algaePoints = 0;
let coralPoints = 0;
let endgamePoints = 0;
let defenseNum = 0;
let defenseTotal = 0;

for (let i = 0; i < props.teamData.rawData.length; i++) {
  let match = props.teamData.rawData[i];
  autoPoints += scoreAuto(match);
  coralPoints += scoreCoral(match);
  algaePoints += scoreAlgae(match);
  endgamePoints += scoreEndgame(match);
  if (match.notes.promptedNotes[2].selected == true) {
    addDefense(match);
  }
}

//four methods to calculate total of a specific match to be used above
function scoreAuto(match: any) {
  if (match.auto.mobility == true) {
    return (
      match.auto.coralL1 * 3 +
      match.auto.coralL2 * 4 +
      match.auto.coralL3 * 6 +
      match.auto.coralL4 * 7 +
      +2
    ); //mobility
  } else {
    return (
      match.auto.coralL1 * 3 +
      match.auto.coralL2 * 4 +
      match.auto.coralL3 * 6 +
      match.auto.coralL4 * 7
    ); //no mobility
  }
}

function scoreCoral(match: any) {
  return (
    match.teleop.coralL1 * 2 +
    match.teleop.coralL2 * 3 +
    match.teleop.coralL3 * 4 +
    match.teleop.coralL4 * 5
  );
}

function scoreAlgae(match: any) {
  return match.teleop.net * 4 + match.teleop.processor * 6;
}

function scoreEndgame(match: any) {
  const endgameOutcomes = match.endgame.endgame;
  let tempEndgamePoints = 0;
  if (endgameOutcomes != null) {
    for (let outcome of endgameOutcomes) {
      if (outcome == 'Deep Successful') {
        tempEndgamePoints = 12;
      } else if (outcome == 'Shallow Successful') {
        tempEndgamePoints = 6;
      } else if (outcome == 'Parked') {
        tempEndgamePoints = 2;
      }
    }
  } else {
    tempEndgamePoints = 0;
  }
  return tempEndgamePoints;
}

function addDefense(match: any) {
  defenseNum += 1;
  defenseTotal += match.notes.promptedNotes[2].rating;
}

let spiderGraphData = ref([
  min((autoPoints / props.maxScores[0]) * 100, 100),
  min((coralPoints / props.maxScores[1]) * 100, 100),
  min((algaePoints / props.maxScores[2]) * 100, 100),
  min((endgamePoints / props.maxScores[3]) * 100, 100),
  min((defenseTotal / defenseNum) * 20, 100) || 0, // THE || MAKES IT SO TEAMS WITH NO DATA DONT BREAK
]);

const spiderGraphLabels = ['Auto', 'Coral', 'Algae', 'Endgame', 'Defense'];

let possibleMissingData = false;
if(spiderGraphData.value[0] < 1 || spiderGraphData.value[1] < 1 || spiderGraphData.value[2] < 1 || spiderGraphData.value[3] < 1 || spiderGraphData.value[4] < 1){
  possibleMissingData = true;
}

const chartTitle = 'Team ' + props.teamData.teamNum;
</script>
<template>
  <UCard class="pt-1">
    <div class="pb-1">
    <SpiderGraph
      :labels="spiderGraphLabels"
      :data="spiderGraphData"
      :title="chartTitle"
      max="100"
      min="0"
      height="h-96"
      :missing="possibleMissingData"
    />
    </div>
  </UCard>
</template>
