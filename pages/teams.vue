<script setup lang="ts">
import databases, {type ScoutingData} from "~/utils/databases";
import IdMeta = PouchDB.Core.IdMeta;
import databases from "~/utils/databases";
import Sentiment from 'sentiment';
import {eventOptions} from "~/utils/eventOptions";

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

const events = eventOptions.map((event) => event.replace(/[0-9]/g, ''))
const currentEvent = localStorage.getItem('currentEvent') || eventOptions[0]
const fetch = useFetch<Array<any>>("/api/eventMatches/" + currentEvent)


let customOptions = ['Has Climb', 'Has Auto']
for(let event of events){
  customOptions.push('event: ' + event)
}
let currentEventID = customOptions.indexOf('event: ' + currentEvent.replace(/[0-9]/g, ''))
const filterOptions = ref(
    Array(customOptions.length)
        .fill({ id: 0, content: "", custom: false})
        .map(
            (_, index) => ({ id: index, content: customOptions[index], custom: false})
        )
)
const currentEventFilter = { id: currentEventID, content: 'event: ' + currentEvent.replace(/[0-9]/g, ''), custom: false }
const selectedFilters = ref<Array<{ id: number, content: string, custom: boolean}>>([currentEventFilter])
watch(selectedFilters, () => {
  tableSetup()
}, {
  deep: true
})


const extraFilterOptions = ["team", "match"]

const { scoutingData } = databases.locals
let db = scoutingData

const matches = (await db.allDocs()).rows
let match = matches.map(async (doc): Promise<ScoutingData & IdMeta> => {
  return await db.get(doc.id)
})

let teamOrgMatches = new Map<number,[ScoutingData & IdMeta]>()

for(let i  = 0; i < match.length; i++){
  let currentMatch = (await match[i])
  let team = typeof currentMatch.teamNumber == "string" ? parseInt(currentMatch.teamNumber): currentMatch.teamNumber
  if (!teamOrgMatches.has(team)) {
    teamOrgMatches.set(team, [currentMatch])
  }
  else {
    let arr : Array<any> = teamOrgMatches.get(team)!
    arr.push(currentMatch)
    teamOrgMatches.set(team, arr)
  }
}



/*
If there are two overlapping matches uses data from only one of them (very basic system needs improvement)
 */
let teamsData : Array<{
  amp: string;
  endgame: [Array<string>, Array<number>];
  mobility: string;
  speaker: string;
  team: number
}> = []

for(let data of teamOrgMatches){
  let matches = teamOrgMatches.get(data[0])
  let matchNumbers: number[] = []
  if(matches) {
    for (let i = 0; i < matches.length; i++) {
      let currMatch = matches[i].matchNumber
      if(matchNumbers.includes(currMatch)) {
        for(let i = 0; i < data[1].length; i++){
          if(data[1][i].matchNumber == currMatch){
            let arr = teamOrgMatches.get(data[0])
            if(arr != undefined){
              arr.splice(i, 1)
              teamOrgMatches.set(data[0], arr)
            }
            break
          }
        }
      }
      else matchNumbers.push(currMatch)
    }
  }
}

console.log(teamOrgMatches)

let teamsData = ref<Array<any>>([])

async function tableSetup() {
  teamsData.value.length = 0

  /*
  Creates two arrays that are filters applied on all data for team numbers and events (includes match number filter)
   */
  let allowedEvents = []
  let allowedTeams = []
  let blueAlliance = []
  let redAlliance = []
  for (let filter of selectedFilters.value) {
    if (filter.content.startsWith("event:")) {
      allowedEvents.push(filter.content.split(":")[1].trim())
    }
    if (filter.content.startsWith("team:")) {
      allowedTeams.push(filter.content.split(":")[1].trim())
    }
    if (filter.content.startsWith("match")) {
      //TODO figure out async stuff
      let tbaMatchData = fetch.data.value
      if(tbaMatchData != null){
        let userInput = parseInt(filter.content.split(':')[1].trim())
        for(let match of tbaMatchData){
          if(match.comp_level == "qm" && match.match_number == userInput){
            for(let team of match.alliances.blue.team_keys){
              let cleanedTeam = team.replace("frc", "")
              if(!allowedTeams.includes(cleanedTeam)) {
                allowedTeams.push(cleanedTeam)
                blueAlliance.push(cleanedTeam)
              }
            }
            for(let team of match.alliances.red.team_keys){
              let cleanedTeam = team.replace("frc", "")
              if(!allowedTeams.includes(cleanedTeam)) {
                allowedTeams.push(cleanedTeam)
                redAlliance.push(cleanedTeam)
              }
            }
          }
        }
      }
    }
  }
  tableLoop: for (let [key, value] of teamOrgMatches) {
    /*
    Data is an array of all matches, associated with a team (key), for the event filters selected
     */
    let data: any = []
    //if sorted by match apply alliance colors
    let alliance = blueAlliance.includes(key.toString()) ? "bg-blue-100": redAlliance.includes(key.toString()) ? "bg-red-100": ""

    if (allowedTeams.includes(key.toString()) || allowedTeams.length == 0) {
      for (let match of value) {
        if (allowedEvents.includes(match.event.replace(/[0-9]/g, ''))) {
          data.push(match)
        }
      }
    }
    /*
    Goes through all remaining filters and applies their effects
     */
    for (let filter of selectedFilters.value) {

      if (filter.id == 0) {
        let hasClimb = false
        for (let match of data) {
          if (match.endgame.endgame.includes("Onstage") || match.endgame.endgame.includes("Attempted Onstage")) {
            hasClimb = true
            break
          }
        }
        if (!hasClimb) {
          continue tableLoop
        }
      }

      if (filter.id == 1) {
        let hasAuto = false
        for (let match of data) {
          if (match.auto.amp > 0 || match.auto.speaker > 0 || match.auto.mobility == true) {
            hasAuto = true
            break
          }
        }
        if (!hasAuto) {
          continue tableLoop
        }
      }
    }
    if (data.length > 0) {
      let arr = {
        team: key,
        amp: getAverageAmpCycles(data).toFixed(2),
        speaker: getAverageSpeakerCycles(data).toFixed(2),
        mobility: averageAuto(data).toFixed(2),
        sentiment: analyzeNotes(data).toFixed(2),
        endgame: compileEndgames(data),
        class: alliance
      }
      teamsData.value.push(arr)
    }
  }

  //Defaults to the alliance colors being together if match filter is selected
  if(redAlliance.length > 0 || blueAlliance.length > 0){
    let sortedData = []
    for(let team of teamsData.value){
      if(team.class == "bg-blue-100") sortedData.unshift(team)
      else sortedData.push(team)
    }
    teamsData.value = sortedData
  }
}

function analyzeNotes(teamArrays: Array<any>){
  let analysisTotal = 0
  for(let match of teamArrays){
    analysisTotal += sentiment.analyze(match.notes.notes, options).score
  }
  return analysisTotal/teamArrays.length
}

function getAverageSpeakerCycles(teamArrays: Array<ScoutingData>){
  let nonAveragedValue = 0
  for(let i = 0; i < teamArrays.length; i++){
    nonAveragedValue += teamArrays[i].auto.speakerNA + teamArrays[i].teleop.speakerNA + teamArrays[i].teleop.speakerA
  }
  return nonAveragedValue/teamArrays.length
}

function getAverageAmpCycles(teamArrays: Array<ScoutingData>){
  let nonAveragedValue = 0
  for(let i = 0; i < teamArrays.length; i++){
    nonAveragedValue += teamArrays[i].auto.amp + teamArrays[i].teleop.amp
  }
  return nonAveragedValue/teamArrays.length
}

function averageAuto(teamArrays: Array<ScoutingData>): number {
  let successfulMobilityCount = 0
  for(let match of teamArrays){
    successfulMobilityCount += match.auto.mobility ? 1 : 0
  }
  return successfulMobilityCount/teamArrays.length
}

function compileEndgames(teamArrays: Array<ScoutingData>): [Array<string>, Array<number>] {
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


tableSetup()
</script>

<template>
<OuterComponents>
  <UCard class="max-h-dvh overflow-auto">
    <template #header>
        <UFormGroup class="w-full" block>
          <FilterMultiSelect v-model="selectedFilters" :options="filterOptions" :extra-options="extraFilterOptions"></FilterMultiSelect>
        </UFormGroup>
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
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid"/>
            <template #panel>
              <UCard>
                <div class="max-w-full min-w-max overflow-y-auto" style="max-height: 20rem; min-height: 10rem">
                  <h1>Match 1</h1>
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