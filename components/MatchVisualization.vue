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

const chartLabels = ['Auto Amp','Auto Speaker', 'Amp', 'Missed Amp', 'Speaker', 'Missed Speaker', 'Trap']
let currData: any = ref(props.rowData.rawData[selectedMatch.value - 1])

watch(selectedMatch, () =>{
  currData.value = props.rowData.rawData[selectedMatch.value - 1]
  chartData.value = [
    currData.value.auto.amp,
    currData.value.auto.speakerNA,
    currData.value.teleop.amp,
    currData.value.teleop.speakerNA,
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
  currData.value.teleop.missedAmp,
  currData.value.teleop.speakerNA,
  currData.value.teleop.missedSpeaker,
  currData.value.endgame.trap,
])
let chartTitle = ref("Match " + currData.value.matchNumber)

let promptedNotesOptions = ["Defense", "Offense", "Driver"]
let promptedNotesDetailedOptions = [["Defense location", "Risk of fouls", "Other"], ["Shooing location(s)", "Ability to avoid defense", "Weakness of cycles", "Other"], ["Strengths", "Weaknesses", "Other"]]

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
            </div>
            <span class="font-extrabold text-sm flex-auto">Spotlight: </span>
            <UBadge color="gray" variant="soft" class="pb-3 mr-1.5 mt-2">{{rowData.rawData[selectedMatch - 1].endgame.spotlight}}</UBadge>
            <div class="text-wrap max-w-72 h-2/3 max-h-2/3 overflow-y-scroll">
              <div v-for="(item, index) in rowData.rawData[selectedMatch - 1].notes.promptedNotes">
                <div v-if="item[0]">
                  <div class="pb-1">
                    <span class="font-extrabold mr-2 text-sm">{{promptedNotesOptions[index] + ":"}}</span>
                    <UBadge :color="item[1] > 3 ? 'green': item[1] < 3 ? 'red' : 'gray'" :variant="item[1] == 2 || item[1] == 4 ? 'soft': 'subtle'">{{item[1]}}</UBadge>
                  </div>
                  <div v-for="(text, i) in item[2]">
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