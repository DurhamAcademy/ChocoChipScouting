<script setup lang="ts">
import SpiderGraph from "~/components/charts/SpiderGraph.vue";
const props = defineProps<{
  teamData: any;
}>();

let autoPoints = 0; let algaePoints = 0; let coralPoints = 0; let endgamePoints = 0;

for(let i = 0; i<(props.teamData.rawData.length); i++){
  let match = props.teamData.rawData[i];
  console.dir(match)
  autoPoints = autoPoints + scoreAuto(match);
  coralPoints = coralPoints + scoreCoral(match);
  algaePoints = algaePoints + scoreAlgae(match);
  endgamePoints = endgamePoints + scoreEndgame(match);
}

//four methods to calculate total of a specific match to be used above
//TODO use scoreMatch.ts once that gets merged
function scoreAuto(match: any){
  if(match.auto.mobility == true){
    return match.auto.coralL1 * 3 + match.auto.coralL2 * 4 +
      match.auto.coralL3 * 6 + match.auto.coralL4 * 7 +
      + 2;//mobility
  }
  else{
    return match.auto.coralL1 * 3 + match.auto.coralL2 * 4 +
      match.auto.coralL3 * 6 + match.auto.coralL4 * 7; //no mobility
  }
}

function scoreCoral(match: any){
  return match.teleop.coralL1 * 2 + match.teleop.coralL2 * 3 +
    match.teleop.coralL3 * 4 + match.teleop.coralL4 * 5;
}

function scoreAlgae(match: any){
  return match.teleop.net * 4 + match.teleop.processor * 6;
}

function scoreEndgame(match: any){
  const endgameOutcomes = match.endgame.endgame;
  let tempEndgamePoints = 0;
  if(endgameOutcomes != null) {
    for (let outcome of endgameOutcomes) {
      if (outcome == "Deep Successful") {
        tempEndgamePoints = 12;
      } else if (outcome == "Shallow Successful") {
        tempEndgamePoints = 6;
      } else if (outcome == "Parked") {
        tempEndgamePoints = 2;
      }
    }
  }
  else {
    tempEndgamePoints = 0;
  }
  return tempEndgamePoints
}

//TODO standardize and add defense
//the /100 will be replaced with max score
let spiderGraphData = ref([
  (autoPoints/100)*100,
  (coralPoints/100)*100,
  (algaePoints/100)*100,
  (endgamePoints/100)*100,
]);

const spiderGraphLabels = [
  'Auto',
  'Coral',
  'Algae',
  'Endgame',
  //TODO add defense
];

const chartTitle = "Team " + props.teamData.teamNum;
</script>
<template>
  <UCard class="mt-4">
    <div class="flex-auto">
      <SpiderGraph
        class="mb-40 flex flex-auto"
        :labels="spiderGraphLabels"
        :data="spiderGraphData"
        :title="chartTitle"
        max="100"
        min="0"
      />
    </div>
  </UCard>
</template>