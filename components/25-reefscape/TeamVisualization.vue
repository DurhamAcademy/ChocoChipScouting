<script setup lang="ts">
import SpiderGraph from "~/components/charts/SpiderGraph.vue";
const props = defineProps<{
  teamData: any;
}>();

const selectedMatch = ref(1);

let currData: any = ref(props.teamData.rawData[selectedMatch.value - 1]);

watch(selectedMatch, () => {
  currData.value = props.teamData.rawData[selectedMatch.value - 1];
  spiderGraphData.value = [
    currData.value.auto.coralL1,
    currData.value.auto.coralL2,
    currData.value.auto.coralL3,
    currData.value.auto.coralL4,
    currData.value.teleop.coralL1,
    currData.value.teleop.coralL2,
    currData.value.teleop.coralL3,
    currData.value.teleop.coralL4,
    currData.value.teleop.net,
    currData.value.teleop.netMiss,
    currData.value.teleop.processor,
    currData.value.teleop.processorMiss,
  ];
});


//TODO standardize
let spiderGraphData = ref([
  currData.value.auto.coralL1 * 3 + currData.value.auto.coralL2 * 4 + currData.value.auto.coralL3 * 6
    + currData.value.auto.coralL4 * 7 + currData.value.auto.mobility * 2,
  currData.value.teleop.coralL1 * 2 + currData.value.teleop.coralL2 * 3 +
    currData.value.teleop.coralL3 * 4 + currData.value.teleop.coralL4 * 5,
  currData.value.teleop.net * 4 + currData.value.teleop.processor * 6,
  5,

]);

const spiderGraphLabels = [
  'Auto',
  'Coral',
  'Algae',
  'Endgame',
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
        ></SpiderGraph>
      </div>
    </UCard>
</template>