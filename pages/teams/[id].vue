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

let teamData = ref<{teamNum: number, teamName: string, rawData: any}>({teamNum: 0, teamName: "", rawData: null})
let teamOptions = ref<Array<number>>([])
let filterTeam = ref(route.params.id)

function setup() {
  teamOptions.value = []
  for (let [key, value] of teamOrgMatches) {
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
        teamName: ""
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
        <h1 class="font-extrabold text-2xl mb-2">{{teamData.teamName != '' ? (teamData.teamNum + ' - ' + teamData.teamName): teamData.teamNum}}</h1>
        <div class="mx-auto flex justify-center align-center">
          <UTooltip text="Team #">
            <UInputMenu
                v-model="filterTeam"
                :options="teamOptions"
                @change="navigateTo('/teams/' + filterTeam)"
                class="max-w-36 w-36 flex-auto"
                placeholder="Select a team"
            />
          </UTooltip>
          <UTooltip text="Event Key">
            <USelectMenu
                v-model="currentEvent"
                :options="eventOptions"
                class="max-w-36 w-36 flex-auto ml-3"
            />
          </UTooltip>
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