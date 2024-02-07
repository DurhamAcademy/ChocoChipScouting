<script setup lang="ts">
import databases from "~/utils/databases";
import Sentiment from 'sentiment';

let sentiment = new Sentiment()
let options = {
  extras: {
    'mid': -2,
    'pretty': 0,
    'broke': -3.5,
    'disabled': -3.5,
    'quickly': 2,
    'easily': 2
  }
}

const selectedFilters = ref<Array<{ id: number, content: string}>>([])
watch(selectedFilters, () => {
  tableSetup()
})
const filterOptions = ref([
  { id: 1, content: 'top 10%' },
])
const extraFilterOptions = ["team", "match"]

const { scoutingData } = databases.locals
let db = scoutingData

const matches = (await db.allDocs()).rows
let match = matches.map(async (doc) => {
  return await db.get(doc.id)
})

let teamOrgMatches = new Map<number, Array<any>>()

for(let i  = 0; i < match.length; i++){
  let currentMatch = (await match[i])
  if(currentMatch.event == window.localStorage.getItem("event") || window.localStorage.getItem("event") == null) {
    if (!teamOrgMatches.has(currentMatch.teamNumber))
      teamOrgMatches.set(currentMatch.teamNumber, [currentMatch])
    else
      teamOrgMatches.get(currentMatch.teamNumber)!.push(currentMatch)
  }
}

let teamsData= ref<Array<any>>([])

tableSetup()

function tableSetup() {
  teamsData.value.length = 0
  tableLoop: for (let [key, value] of teamOrgMatches) {
    if (selectedFilters.value.length > 0) {
      for (let filter of selectedFilters.value) {
        if (filter.content.startsWith("team:")) {
          if (parseInt(filter.content.split(":")[1].trim()) != key)
            continue tableLoop
        }
      }
    }
    let arr = {
      team: key,
      amp: getAverageAmpCycles(value).toFixed(2),
      speaker: getAverageSpeakerCycles(value).toFixed(2),
      mobility: averageAuto(value).toFixed(2),
      sentiment: analyzeNotes(value).toFixed(2),
      endgame: compileEndgames(value)
    }
    teamsData.value.push(arr)
  }
}

function analyzeNotes(teamArrays: Array<any>){
  let analysisTotal = 0
  for(let match of teamArrays){
    analysisTotal += sentiment.analyze(match.notes.notes, options).score
  }
  return analysisTotal/teamArrays.length
}

function getAverageSpeakerCycles(teamArrays: Array<any>){
  let nonAveragedValue = 0
  for(let i = 0; i < teamArrays.length; i++){
    nonAveragedValue += teamArrays[i].auto.speakerNA + teamArrays[i].teleop.speakerNA + teamArrays[i].teleop.speakerA
  }
  return nonAveragedValue/teamArrays.length
}

function getAverageAmpCycles(teamArrays: Array<any>){
  let nonAveragedValue = 0
  for(let i = 0; i < teamArrays.length; i++){
    nonAveragedValue += teamArrays[i].auto.amp + teamArrays[i].teleop.amp
  }
  return nonAveragedValue/teamArrays.length
}

function averageAuto(teamArrays: Array<any>){
  let successfulMobilityCount = 0
  for(let match of teamArrays){
    successfulMobilityCount += match.auto.leave ? 1 : 0
  }
  return successfulMobilityCount/teamArrays.length
}

function compileEndgames(teamArrays: Array<any>){
  let endgameMap = new Map<string, number>();
  for(let i = 0; i < teamArrays.length; i++) {
    teamArrays[i].endgame.endgame.forEach(function (value: string) {
        if (endgameMap.has(value)) {
          endgameMap.set(value, endgameMap.get(value)! + 1)
        } else
          endgameMap.set(value, 1)

    })
  }
  let endgameOptionsArr : Array<string> = []
  let endgameDataArr : Array<number> = []
  endgameMap.forEach(function(value, key){
    endgameOptionsArr.push(key)
    endgameDataArr.push(value)
  })
  return [endgameOptionsArr, endgameDataArr]
}

const columns = [{
  key: 'team',
  label: 'Team #',
}, {
  key: 'amp',
  label: 'Average Amp Cycles',
  sortable: true
}, {
  key: 'speaker',
  label: 'Average Speaker Cycles',
  sortable: true
}, {
  key: 'mobility',
  label: 'Mobility Success Rate',
  sortable: true
}, {
  key: 'sentiment',
  label: 'Sentiment Analysis',
  sortable: true
}, {
  key: 'actions',
  label: 'Endgame'
},{
  key: 'dropdown'
}]

const page = ref(1)
//two constants for screen size
const pageCount = ref(Math.floor((window.innerHeight - 236.5)/72.9375))

const rows = computed(() => {
  return teamsData.value.slice((page.value - 1) * pageCount.value, (page.value) * pageCount.value)
})

</script>

<template>
<OuterComponents>
  <UCard class="max-h-dvh">
    <template #header class="fixed">
        <UFormGroup class="w-full" block>
          <FilterMultiSelect v-model="selectedFilters" :options="filterOptions" :extra-options="extraFilterOptions"></FilterMultiSelect>
        </UFormGroup>
    </template>
      <UTable :rows="rows" :columns="columns" >

      <template #actions-data="{ row }">
        <UPopover>
          <UButton class="m-1" color="blue" label="Chart" variant="soft" />
          <template #panel>
            <UCard>
              <div class="max-w-xs min-w-[15rem] overflow-y-auto" style="max-height: 20rem; min-height: 10rem">
                <PieChart :labels="row.endgame[0]" :data="row.endgame[1]"/>
              </div>
            </UCard>
          </template>
        </UPopover>
      </template>

      <template #dropdown-data="{ row }">
        <UPopover>
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          <template #panel>
            <UCard>
              <div class="max-w-full min-w-max overflow-y-auto" style="max-height: 20rem; min-height: 10rem">

              </div>
            </UCard>
          </template>
        </UPopover>
      </template>

    </UTable>
    <div class="flex px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
      <UPagination v-model="page" :page-count="pageCount" :total="teamsData.length" />
    </div>
  </UCard>
</OuterComponents>
</template>

<style scoped>

</style>