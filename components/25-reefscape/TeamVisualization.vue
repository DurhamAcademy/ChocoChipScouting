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

let spiderGraphData = ref([
  currData.value.auto.coralL1 + currData.value.auto.coralL2 +currData.value.auto.coralL3 + currData.value.auto.coralL4,
  currData.value.teleop.coralL1 + currData.value.teleop.coralL2 + currData.value.teleop.coralL3 + currData.value.teleop.coralL4,
  currData.value.teleop.net,
  currData.value.teleop.processor,
]);

const spiderGraphLabels = [
  'Auto Coral',
  'Teleop Coral',
  'Net',
  'Processor',
  //TODO: average penalties
];

//TODO: turn this into a variable
const chartTitle = "temp title"
</script>
<template>
    <UCard>
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