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
      <UCard>
        <div class="h-80 overflow-scroll flex">
          <BarChart
            class="flex-auto w-80 mr-5"
            :labels="chartLabels"
            :data="chartData"
            :chart-title="chartTitle"
          ></BarChart>
          <div class="flex-auto whitespace-normal w-72 max-w-72">
            <p class="font-bold">Auto & Endgame: </p>
            <div>
              <UBadge color="sky" variant="subtle" v-if="rowData.rawData[selectedMatch - 1].auto.mobility" class="mr-1.5 mt-2">Mobility</UBadge>
              <UBadge color="indigo" variant="subtle" v-for="endgame in rowData.rawData[selectedMatch - 1].endgame.endgame" class="mr-1.5 mt-2"> {{ endgame }} </UBadge>
            </div>
            <br>
            <p class="font-bold">Notes: </p>
            <p>{{rowData.rawData[selectedMatch - 1].notes.notes}}</p>
          </div>
        </div>
        <template #footer>
        <UPagination
            v-model="selectedMatch"
            :total="rowData.rawData.length"
            show-last
            show-first
            :page-count="1"
            :max="7"
            :active-button="{ variant: 'outline' }"
            :inactive-button="{ color: 'gray' }"
        />
        </template>
      </UCard>
</template>