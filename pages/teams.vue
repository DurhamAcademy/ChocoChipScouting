<script setup lang="ts">
import databases from "~/utils/databases";
import Sentiment from 'sentiment';
import {useSelectedEvent} from "~/composables/useSelectedEvent";
import {getEventOptions} from "~/composables/getEventOptions";

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

const events = getEventOptions().value
const currentEvent = useSelectedEvent()

const currentEventFilter = { id: 2, content: 'event: ' + currentEvent.value, custom: false }
const selectedFilters = ref<Array<{ id: number, content: string, custom: boolean}>>([currentEventFilter])
watch(selectedFilters, () => {
  tableSetup()
}, {
  deep: true
})
let customOptions = ['Has Climb', 'Has Auto']
for(let event of events){
  customOptions.push('event: ' + event)
}
const filterOptions = ref(
    Array(customOptions.length)
        .fill({ id: 0, content: "", custom: false})
        .map(
            (_, index) => ({ id: index, content: customOptions[index], custom: false})
        )
)


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
  if (!teamOrgMatches.has(currentMatch.teamNumber))
    teamOrgMatches.set(currentMatch.teamNumber, [currentMatch])
  else
    teamOrgMatches.get(currentMatch.teamNumber)!.push(currentMatch)
}

let teamsData= ref<Array<any>>([])

tableSetup()

function tableSetup() {
  teamsData.value.length = 0
  tableLoop: for (let [key, value] of teamOrgMatches) {
    /*
    Data is an array of all matches, associated with a team (key), for the event filters selected
     */
    let data: any = []
    let allowedEvents = []
    let allowedTeams = []
    for(let filter of selectedFilters.value){
      if(filter.content.startsWith("event:")){
        allowedEvents.push(filter.content.split(":")[1].trim())
      }
      if(filter.content.startsWith("team:")){
        allowedTeams.push(filter.content.split(":")[1].trim())
      }
    }
    if(allowedTeams.includes(key.toString()) || allowedTeams.length == 0){
      for(let match of value){
        if(allowedEvents.includes(match.event)){
          data.push(match)
        }
      }
    }
    /*
    Goes through all remaining filters and applies their effects
     */
    for (let filter of selectedFilters.value) {

      if(filter.id == 0){
        let hasClimb = false
        for(let match of data){
          if(match.endgame.endgame.includes("Onstage") || match.endgame.endgame.includes("Attempted Onstage")){
            hasClimb = true
            break
          }
        }
        if(!hasClimb){
          continue tableLoop
        }
      }

      if(filter.id == 1){
        let hasAuto = false
        for(let match of data){
          if(match.auto.amp > 0 || match.auto.speaker > 0 || match.auto.mobility == true){
            hasAuto = true
            break
          }
        }
        if(!hasAuto){
          continue tableLoop
        }
      }

    }
    if(data.length > 0) {
      let arr = {
        team: key,
        amp: getAverageAmpCycles(data).toFixed(2),
        speaker: getAverageSpeakerCycles(data).toFixed(2),
        mobility: averageAuto(data).toFixed(2),
        sentiment: analyzeNotes(data).toFixed(2),
        endgame: compileEndgames(data)
      }
      teamsData.value.push(arr)
    }
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
    successfulMobilityCount += match.auto.mobility ? 1 : 0
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



</script>

<template>
<OuterComponents>
  <UCard class="max-h-dvh overflow-auto">
    <template #header>
        <UFormGroup class="w-full" block>
          <FilterMultiSelect v-model="selectedFilters" :options="filterOptions" :extra-options="extraFilterOptions"></FilterMultiSelect>
        </UFormGroup>
      <UButton @click="console.log(selectedFilters)">
      </UButton>
    </template>
      <UTable :rows="teamsData" :columns="columns" class="overflow-auto">

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
  </UCard>
</OuterComponents>
</template>

<style scoped>

</style>