<script setup lang="ts">
import Sentiment from "sentiment";

let sentiment = new Sentiment()
let options = {
  extras: {
    'mid': -2,
    'pretty': 0,
    'broke': -3.5,
    'disabled': -3.5,
    'quickly': 2,
    'easily': 2,
    'dog': -3
  }
}

const props = defineProps<{
  rowData: any,
}>()

const selectedMatch = ref(1)

props.rowData.rawData.sort(compareMatchNumbers)

function compareMatchNumbers(a: any, b: any){
  //TODO i hate this work around rly need to fix this
  let matchA = typeof a.matchNumber == "string" ? parseInt(a.matchNumber): a.matchNumber
  let matchB = typeof b.matchNumber == "string" ? parseInt(b.matchNumber): b.matchNumber
  if (matchA < matchB) {
    return -1;
  }
  if (matchA > matchB) {
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
  sentimentScore = sentiment.analyze(props.rowData.rawData[selectedMatch.value - 1].notes.notes).score
})

let sentimentScore = sentiment.analyze(props.rowData.rawData[selectedMatch.value - 1].notes.notes).score


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
        <div class="flex-wrap flex">
          <div class="flex-auto mr-5 width=device-width">
            <BarChart
                class="mb-1"
                :labels="chartLabels"
                :data="chartData"
                :chart-title="chartTitle"
                :height="'290px'"
            ></BarChart>
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
          </div>
          <div class="flex-auto whitespace-normal w-72 max-w-72 overflow-auto">
            <p class="font-bold">Auto & Endgame: </p>
            <div class="pb-2.5">
              <UBadge color="sky" variant="subtle" v-if="rowData.rawData[selectedMatch - 1].auto.mobility" class="mr-1.5 mt-2">Mobility</UBadge>
              <UBadge color="indigo" variant="subtle" v-for="endgame in rowData.rawData[selectedMatch - 1].endgame.endgame" class="mr-1.5 mt-2"> {{ endgame }} </UBadge>
            </div>
            <p class="font-bold">Notes: </p>
            <p class="pb-2.5">{{rowData.rawData[selectedMatch - 1].notes.notes == "" ? "None": rowData.rawData[selectedMatch - 1].notes.notes}}</p>
            <div>
              <span class="font-bold mr-2">Sentiment Analysis: </span>
              <UBadge :color="sentimentScore > 1 ? 'green': sentimentScore < -1 ? 'red' : 'gray'" :variant="sentimentScore < 1 && sentimentScore > -1 ? 'soft': 'subtle'">{{sentimentScore}}</UBadge>
            </div>
          </div>
        </div>
      </UCard>
</template>