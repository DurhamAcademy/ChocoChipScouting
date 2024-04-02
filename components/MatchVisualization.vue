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

const chartLabels = ['Auto Amp','Auto Amp Miss', 'Auto Speaker', 'Auto Speaker Miss', 'Amp', 'Amp Miss', 'Speaker', 'Speaker Miss', 'Trap']
let currData: any = ref(props.rowData.rawData[selectedMatch.value - 1])

watch(selectedMatch, () =>{
  currData.value = props.rowData.rawData[selectedMatch.value - 1]
  chartData.value = [
    currData.value.auto.amp,
    currData.value.auto.missedAmp || 0,
    currData.value.auto.speakerNA,
    currData.value.auto.missedSpeaker || 0,
    currData.value.teleop.amp,
    currData.value.teleop.missedAmp || 0,
    currData.value.teleop.speakerNA,
    currData.value.teleop.missedSpeaker || 0,
    currData.value.endgame.trap,
  ]
  chartTitle.value = "Match " + currData.value.matchNumber
  sentimentScore = sentiment.analyze(props.rowData.rawData[selectedMatch.value - 1].notes.notes).score
})

let sentimentScore = sentiment.analyze(props.rowData.rawData[selectedMatch.value - 1].notes.notes).score

//TODO eventually get rid of the || 0s because they are just backwards compatability

let chartData = ref([
  currData.value.auto.amp,
  currData.value.auto.missedAmp || 0,
  currData.value.auto.speakerNA,
  currData.value.auto.missedSpeaker || 0,
  currData.value.teleop.amp,
  currData.value.teleop.missedAmp || 0,
  currData.value.teleop.speakerNA,
  currData.value.teleop.missedSpeaker || 0,
  currData.value.endgame.trap,
])
let chartTitle = ref("Match " + currData.value.matchNumber)

let promptedNotesOptions = ["Defense", "Offense", "Driver"]
let promptedNotesDetailedOptions = [["Defense location", "Risk of fouls", "Other"], ["Shooing location(s)", "Ability to avoid defense", "Weakness of cycles", "Other"], ["Strengths", "Weaknesses", "Other"]]

console.log(props.rowData.rawData)

</script>

<template>
      <UCard>
        <div class="flex flex-wrap">
          <div class="flex-auto">
            <BarChart
                class="mb-1"
                :labels="chartLabels"
                :data="chartData"
                :chart-title="chartTitle"
                height="h-64"
                width="w-64"
            ></BarChart>
          </div>
          <div class="flex-auto whitespace-normal max-h-72 w-72 max-w-72">
            <p class="font-extrabold text-sm">Auto & Endgame: </p>
            <div class="pb-1">
              <UBadge color="sky" variant="subtle" v-if="rowData.rawData[selectedMatch - 1].auto.mobility" class="mr-1.5 mt-2">Mobility</UBadge>
              <UBadge color="indigo" variant="subtle" v-for="endgame in rowData.rawData[selectedMatch - 1].endgame.endgame" class="mr-1.5 mt-2"> {{ endgame }} </UBadge>
              <UBadge color="emerald" variant="subtle" v-if="rowData.rawData[selectedMatch - 1].endgame.spotlight > 0" class="mr-1.5 mt-2">Spotlight: {{ rowData.rawData[selectedMatch - 1].endgame.spotlight }} </UBadge>
            </div>
            <div class="text-wrap max-w-72 h-2/3 max-h-2/3 overflow-y-scroll">
              <div v-for="(item, index) in rowData.rawData[selectedMatch - 1].notes.promptedNotes">
                <div v-if="item.selected">
                  <div class="pb-1">
                    <span class="font-extrabold mr-2 text-sm">{{promptedNotesOptions[index] + ":"}}</span>
                    <UBadge :color="item.rating > 3 ? 'green': item.rating < 3 ? 'red' : 'gray'" :variant="item.rating == 2 || item.rating == 4 ? 'soft': 'subtle'">{{item.rating}}</UBadge>
                  </div>
                  <div v-for="(text, i) in item.notes">
                    <p v-if="text != ''" class="text-xs pb-0 font-semibold underline-offset-2" >{{promptedNotesDetailedOptions[index][i] + ':'}}</p>
                    <p v-if="text != ''" class="pb-2.5 text-xs">{{text}}</p>
                  </div>
                </div>
              </div>
              <span class="font-extrabold text-sm">Other notes: </span>
              <UBadge :color="sentimentScore > 1 ? 'green': sentimentScore < -1 ? 'red' : 'gray'" :variant="sentimentScore < 1 && sentimentScore > -1 ? 'soft': 'subtle'">{{sentimentScore}}</UBadge>
              <p class="pb-2 text-xs">{{rowData.rawData[selectedMatch - 1].notes.notes == "" ? "None": rowData.rawData[selectedMatch - 1].notes.notes}}</p>
            </div>
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