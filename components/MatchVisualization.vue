<script setup lang="ts">

const props = defineProps<{
  rowData: any,
}>()

const selectedMatch = ref(1)

props.rowData.rawData.sort(compareMatchNumbers)

function compareMatchNumbers(a: any, b: any){
  if (a.matchNumber < b.matchNumber) {
    return -1;
  }
  if (a.matchNumber > b.matchNumber) {
    return 1;
  }
  return 0;
}

const chartLabels = ['Auto Amp', 'Auto Speaker', 'Amp', 'Speaker', 'Speaker+', 'Trap']
let currData: any = ref(props.rowData.rawData[selectedMatch.value - 1])

watch(selectedMatch, () =>{
  currData.value = props.rowData.rawData[selectedMatch.value - 1]
  chartData.value = [
    currData.value.auto.amp,
    currData.value.auto.speakerNA,
    currData.value.teleop.amp,
    currData.value.teleop.speakerNA,
    currData.value.teleop.speakerA,
    currData.value.endgame.trap,
  ]
  chartTitle.value = "Match " + currData.value.matchNumber
})


let chartData = ref([
  currData.value.auto.amp,
  currData.value.auto.speakerNA,
  currData.value.teleop.amp,
  currData.value.teleop.speakerNA,
  currData.value.teleop.speakerA,
  currData.value.endgame.trap,
])
let chartTitle = ref("Match " + currData.value.matchNumber)

</script>

<template>
      <UCard class="max-w-96 w-96 whitespace-normal">
        <div class="h-96 overflow-scroll">
          <BarChart
            class="flex-auto"
            :labels="chartLabels"
            :data="chartData"
            :chart-title="chartTitle"
          ></BarChart>
          <br>
          <p class="font-bold">Notes: </p>
          <p>{{rowData.notes[selectedMatch - 1]}}</p>
        </div>
        <template #footer>
        <UPagination
            v-model="selectedMatch"
            :total="rowData.notes.length"
            show-last
            show-first
            :page-count="1"
            :max="7"
        />
        </template>
      </UCard>
</template>