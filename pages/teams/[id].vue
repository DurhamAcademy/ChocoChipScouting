<script setup lang="ts">

import databases, {type ScoutingData} from "~/utils/databases";
import MatchVisualization from "~/components/MatchVisualization.vue";
import IdMeta = PouchDB.Core.IdMeta;
import {eventOptions} from "~/utils/eventOptions";
import {useWindowSize} from "@vueuse/core";

let {width, height} = useWindowSize()

const events = eventOptions.map((event) => event.replace(/[0-9]/g, ''))
let currentEvent = ref(eventOptions[0])
if (typeof window !== 'undefined') currentEvent.value = localStorage.getItem('currentEvent') || eventOptions[0]

const { scoutingData } = databases.locals
let db = scoutingData

const route = useRoute()

const matches = (await db.allDocs()).rows
let match = matches.map(async (doc): Promise<ScoutingData & IdMeta> => {
  return await db.get(doc.id)
})

let teamOrgMatches = new Map<number,Array<ScoutingData & IdMeta>>()
let extraNotes = new Map<number, Array<string>>()

  for (let i = 0; i < match.length; i++) {
    let currentMatch = (await match[i])
    if (currentMatch.matchNumber != -1) {
      let team = typeof currentMatch.teamNumber == "string" ? parseInt(currentMatch.teamNumber) : currentMatch.teamNumber
      if (!teamOrgMatches.has(team)) {
        teamOrgMatches.set(team, [currentMatch])
      } else {
        let arr: Array<ScoutingData & IdMeta> = teamOrgMatches.get(team)!
        arr.push(currentMatch)
        teamOrgMatches.set(team, arr)
      }
    } else if (currentMatch.notes.notes != undefined) {
      let team = typeof currentMatch.teamNumber == "string" ? parseInt(currentMatch.teamNumber) : currentMatch.teamNumber
      if (!extraNotes.has(team)) {
        extraNotes.set(team, [currentMatch.notes.notes])
      } else {
        let arr: Array<string> = extraNotes.get(team)!
        arr.push(currentMatch.notes.notes)
        extraNotes.set(team, arr)
      }
    }
  }

let teamData = ref<{teamNum: number, teamName: string, rawData: any, penaltyScore: number}>({teamNum: 0, teamName: "", rawData: null, penaltyScore: 0})
let teamOptions = ref<Array<number>>([])
let filterTeam = ref(route.params.id)

function setup() {
  teamOptions.value = []
  for (let [key, value] of teamOrgMatches) {
    if(typeof key == 'string') key = parseInt(key)
    let filteredValue: (ScoutingData & IdMeta)[] = []
    for (let match of value) {
      if (match.event == currentEvent.value) {
        if (!teamOptions.value.includes(key)) {
          teamOptions.value.push(key)
        }
        filteredValue.push(match)
      }
    }
    if (key.toString() == filterTeam.value) {
      teamData.value = {
        teamNum: key,
        rawData: filteredValue,
        teamName: "",
        penaltyScore: 0
      }
    }
  }
  teamOptions.value.sort()
  findTeamName()
}
setup()

async function findTeamName(){
  let {teamData: db} = databases.locals
  //gets all the teamsData docs from the database and adds them to one array
  let dbTeams = (await db.allDocs()).rows.map(async (doc): Promise<TeamData> => {
    return db.get(doc.id)
  })
  Promise.all(dbTeams).then((teams: Array<TeamData>) => {
      teams.forEach((team) => {
        if(team.teamNum == teamData.value.teamNum){
          teamData.value.teamName = team.teamName
        }
      })
  })
}

const {data: tbaMatchData, pending: tbaPending} = useLazyFetch<Array<any>>("/api/eventMatches/" + currentEvent.value)
function getTeamPenaltyCount(){
  if(!tbaPending.value && tbaMatchData.value != null){
    let teamsMap = new Map()
    for(let match of tbaMatchData.value){
      if(match.comp_level == "qm"){
        for(let team of match.alliances.red.team_keys){
          let teamNum = parseInt(team.substring(3))
          if(teamsMap.has(teamNum)){
            let increasedValues =
                [
                  teamsMap.get(teamNum)[0] + (match.score_breakdown.red.foulCount + match.score_breakdown.red.techFoulCount) / 3,
                  teamsMap.get(teamNum)[1] + 1
                ]
            teamsMap.set(teamNum, increasedValues)
          }
          else{
            teamsMap.set(teamNum, [
              (match.score_breakdown.red.foulCount + match.score_breakdown.red.techFoulCount) / 3,
              1
            ])
          }
        }
        for(let team of match.alliances.blue.team_keys){
          let teamNum = parseInt(team.substring(3))
          if(teamsMap.has(teamNum)){
            let increasedValues =
                [
                  teamsMap.get(teamNum)[0] + (match.score_breakdown.blue.foulCount + match.score_breakdown.blue.techFoulCount) / 3,
                  teamsMap.get(teamNum)[1] + 1
                ]
            teamsMap.set(teamNum, increasedValues)
          }
          else{
            teamsMap.set(teamNum, [
              (match.score_breakdown.blue.foulCount + match.score_breakdown.blue.techFoulCount) / 3,
              1
            ])
          }
        }
      }
    }
    return teamsMap
  }
  return new Map()
}

let upperQuarterCutoff = ref(1)

watch(tbaPending, (value) => {
  if(!value){
    let map = getTeamPenaltyCount()
    let valuesArr = Array.from(map.values())
    let percentile = .75
    let calculatedValuesArr = valuesArr.map((value: Array<number>) => {
      return value[0]/value[1] || 0
    })
    calculatedValuesArr.sort()
    upperQuarterCutoff.value = calculatedValuesArr[Math.floor(valuesArr.length * percentile)]
    let teamNum = filterTeam.value + ""
    if(map.has(parseInt(teamNum))){
      let mapValues = map.get(parseInt(teamNum))
      teamData.value.penaltyScore = mapValues[0] / mapValues[1] || 0
    }
  }
})


watch(currentEvent, (value) => {
  setup()
  try{
    localStorage.setItem('currentEvent', value)
  }
  catch{}
})

async function goBack() {
  navigateTo("/teams/")
}

let margin = ref(width.value > 800 ? "ml-2": "")
watch(width, () => {
  margin.value = width.value > 800 ? "ml-2": "mt-4"
})

</script>

<template>
  <UCard class="w-full h-full">
    <template #header>
      <UButton class="absolute left-2 top-2" variant="ghost" size="xl" icon="i-heroicons-arrow-left" @click="goBack"/>
        <div class="text-center justify-center">
          <UTooltip :text="'Avg Penalties: ' + teamData.penaltyScore.toFixed(2)" :popper="{ offsetDistance: -2 }">
            <div>
              <svg v-if="teamData.penaltyScore > upperQuarterCutoff" class="mb-2 mr-1 inline-block stroke-rose-500 fill-rose-200 w-6 h-6" viewBox="0 0 24 24" >
                <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
              </svg>
              <h1 class="inline-block font-extrabold text-2xl mb-2">{{teamData.teamName != '' ? (teamData.teamNum + ' - ' + teamData.teamName): teamData.teamNum}}</h1>
            </div>
          </UTooltip>
        <div class="mx-auto flex justify-center align-center">
          <UInputMenu
              v-model="filterTeam"
              :options="teamOptions"
              @change="navigateTo('/teams/' + filterTeam)"
              class="max-w-36 w-36 flex-auto h-8"
              placeholder="Select a team"
          />
          <USelectMenu
              v-model="currentEvent"
              :options="eventOptions"
              class="max-w-36 w-36 flex-auto h-8 ml-3"
          />
        </div>
      </div>
    </template>

    <div class="flex flex-wrap" v-if="teamData.rawData.length > 0">
      <div class="flex-auto h-1/3 mr-2">
        <MatchVisualization :row-data="teamData"></MatchVisualization>
      </div>
      <div :class="'flex-auto h-min max-h-min flex-wrap ' + margin">
        <AmpVisualization :row-data="teamData"></AmpVisualization>
        <SpeakerVisualization class="mt-4" :row-data="teamData"></SpeakerVisualization>
      </div>
    </div>
    <div v-else class="opacity-50">
      <NuxtImg class="mx-auto" src="/sadcookie.png" height="400" width="400" />
      <h1 class="font-sans text-xl font-bold text-center">Looks like there is no data on team {{teamData.teamNum}} at {{currentEvent}} :(</h1>
    </div>
  </UCard>
</template>

<style scoped>

</style>