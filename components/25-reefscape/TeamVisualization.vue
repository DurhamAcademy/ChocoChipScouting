<script setup lang="ts">
import SpiderGraph from '~/components/charts/SpiderGraph.vue';
import { min } from '@popperjs/core/lib/utils/math';
const props = defineProps<{
  teamData: any;
  maxScores: any;
}>();

//a method to add up the total points of one team at a given event
let autoPoints = 0;
let algaePoints = 0;
let coralPoints = 0;
let endgamePoints = 0;
let defenseNum = 0;
let defenseTotal = 0;

for (let j in props.teamData.rawData) {
  let match = props.teamData.rawData[j];
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


//standardizes all values to be a % out of 100, where 100
//is the highest score by any team at the event
let spiderGraphData = ref([
  min((autoPoints / props.maxScores[0]) * 100, 100) || 0,
  min((coralPoints / props.maxScores[1]) * 100, 100) || 0,
  min((algaePoints / props.maxScores[2]) * 100, 100) || 0,
  min((endgamePoints / props.maxScores[3]) * 100, 100) || 0,
  min((defenseTotal / defenseNum) * 20, 100) || 0, // THE || MAKES IT SO TEAMS WITH NO DATA DONT BREAK
]);

const spiderGraphLabels = ['Auto', 'Coral', 'Algae', 'Endgame', 'Defense'];

//determines whether or not to show the missing data text
//decided by whether or not a number is 0
let possibleMissingData = false;
for(let i in spiderGraphData.value){
  if (spiderGraphData.value[i] < 1){
    possibleMissingData=true;
    break;
  }
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
