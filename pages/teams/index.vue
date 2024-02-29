<script setup lang="ts">
import databases, {type ScoutingData} from "~/utils/databases";
import IdMeta = PouchDB.Core.IdMeta;
import Sentiment from 'sentiment';
import {eventOptions} from "~/utils/eventOptions";
import AmpVisualization from "~/components/AmpVisualization.vue";
import MatchVisualization from "~/components/MatchVisualization.vue";
import SpeakerVisualization from "~/components/SpeakerVisualization.vue";
import {useWindowSize} from "@vueuse/core";
import MiscPopup from "~/components/MiscPopup.vue";

const toast = useToast()
let {width, height} = useWindowSize()
let modalOpen = ref([])

let openAttachments = ref(false)

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

const events = eventOptions.map((event) => event.replace(/[0-9]/g, ''))
let currentEvent = eventOptions[0]
if (typeof window !== 'undefined') currentEvent = localStorage.getItem('currentEvent') || eventOptions[0]
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
watch(selectedFilters, async () => {
  await tableSetup()
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

let teamOrgMatches = new Map<number,Array<ScoutingData & IdMeta>>()
let extraNotes = new Map<number, Array<string>>()

for(let i  = 0; i < match.length; i++){
  let currentMatch = (await match[i])
  if(currentMatch.matchNumber != -1) {
    let team = typeof currentMatch.teamNumber == "string" ? parseInt(currentMatch.teamNumber) : currentMatch.teamNumber
    if (!teamOrgMatches.has(team)) {
      teamOrgMatches.set(team, [currentMatch])
    } else {
      let arr: Array<ScoutingData & IdMeta> = teamOrgMatches.get(team)!
      arr.push(currentMatch)
      teamOrgMatches.set(team, arr)
    }
  }
  else if(currentMatch.notes.notes != undefined){
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

let teamsData = ref<any>([])

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
      let tbaMatchData = await fetch.data.value
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
    if(key == undefined) continue
    /*
    Data is an array of all matches, associated with a team (key), for the event filters selected
     */
    let data: Array<ScoutingData & IdMeta> = []
    //if sorted by match apply alliance colors
    let alliance = blueAlliance.includes(key.toString()) ? "bg-blue-100": redAlliance.includes(key.toString()) ? "bg-red-100": ""

    if (allowedTeams.includes(key.toString()) || allowedTeams.length == 0) {
      for (let match of value) {
        if (match.event != undefined && allowedEvents.includes( match.event.replace(/[0-9]/g, ''))) {
          data.push(match)
        }
      }
    }

    let teamExtraNotes = extraNotes.get(key)
    if(teamExtraNotes == undefined) teamExtraNotes = []

    /*
    Removes match overlaps
     */
    let matchNumbers: number[] = []
    for(let value of data){
      let currMatch = value.matchNumber
      if(matchNumbers.includes(currMatch)) {
        for(let i = 0; i < data.length; i++){
          if(data[i].matchNumber == currMatch){
            data.splice(data.indexOf(data[i]), 1)
            break
          }
        }
      }
      else matchNumbers.push(currMatch)
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
          if (match.auto.amp > 0 || match.auto.speakerNA > 0 || match.auto.mobility) {
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
        endgame: compileEndgames(data),
        defense: averageDefensiveScore(data).toFixed(2),
        class: alliance,
        rawData: data,
        extraNotes: teamExtraNotes
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

function debug(text:string){
  toast.add({ title: text })
}

function averageDefensiveScore(teamArrays: Array<any>){
  let total = 0
  for(let match of teamArrays){
    if(match.notes.playedDefense) total += match.notes.defense
  }
  return total / teamArrays.length
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

async function view(teamNum: number) {
  navigateTo("/teams/"+teamNum)
  openAttachments.value = true
}

const columns = [{
  key: 'team',
  label: 'Team',
  sortable: true
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
  key: 'defense',
  label: 'Defensive Score',
  sortable: true
}, {
  key: 'actions',
  label: 'Endgame'
}, {
  key: 'buttons',
}]

const graphOptions = ['Match Stats', 'Amp', 'Speaker', 'Misc']
const selectedGraph = ref(graphOptions[0])

await tableSetup()
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
            <UButton class="m-1" label="Chart" variant="soft" />
            <template #panel>
              <UCard>
                <div class="max-w-xs min-w-[15rem] overflow-y-auto" style="max-height: 20rem; min-height: 10rem">
                  <PieChart :labels="row.endgame[0]" :data="row.endgame[1]"/>
                </div>
              </UCard>
            </template>
          </UPopover>
        </template>
        <template #buttons-data="{ row }">
          <div class="flex">
            <UButton @click="view(row.team)" icon="i-heroicons-paper-clip" color="gray" variant="ghost"/>
            <UPopover v-if=" width > 800" :popper="{ placement: teamsData.indexOf(row) > teamsData.length/2 ? 'top-end': 'bottom-end' }">
              <UButton variant="ghost" color="gray" icon="i-heroicons-document-chart-bar"/>
              <template #panel>
                <div class="flex">
                  <UCard class="flex-auto">
                    <template #header>
                      <UButtonGroup>
                        <UButton :variant="selectedGraph == label ? 'solid' : 'soft'"  v-for="label in graphOptions" @click="selectedGraph = label" :label="label"></UButton>
                      </UButtonGroup>
                    </template>
                    <MatchVisualization v-if="selectedGraph == 'Match Stats'" :row-data="row"></MatchVisualization>
                    <AmpVisualization v-if="selectedGraph == 'Amp'" :row-data="row"></AmpVisualization>
                    <SpeakerVisualization v-if="selectedGraph == 'Speaker'" :row-data="row"></SpeakerVisualization>
                    <MiscPopup v-if="selectedGraph == 'Misc'" :row-data="row"></MiscPopup>
                  </UCard>
                </div>
              </template>
            </UPopover>
            <div v-else>
              <UButton variant="ghost" color="gray" icon="i-heroicons-document-chart-bar" @click="modalOpen[teamsData.indexOf(row)] = true"/>
              <UModal v-model="modalOpen[teamsData.indexOf(row)]">
                <div class="flex">
                  <UCard class="flex-auto">
                    <template #header>
                      <UButtonGroup>
                        <UButton :variant="selectedGraph == label ? 'solid' : 'soft'"  v-for="label in graphOptions" @click="() => {selectedGraph = label; modalOpen[teamsData.indexOf(row)] = true}" :label="label"></UButton>
                      </UButtonGroup>
                    </template>
                    <MatchVisualization v-if="selectedGraph == 'Match Stats'" :row-data="row"></MatchVisualization>
                    <AmpVisualization v-if="selectedGraph == 'Amp'" :row-data="row"></AmpVisualization>
                    <SpeakerVisualization v-if="selectedGraph == 'Speaker'" :row-data="row"></SpeakerVisualization>
                    <MiscPopup v-if="selectedGraph == 'Misc'" :row-data="row"></MiscPopup><UButton
                        icon="i-heroicons-x-mark"
                        size="md"
                        color="primary"
                        circle
                        variant="solid"
                        class="absolute right-8 top-8"
                        @click="modalOpen[teamsData.indexOf(row)] = false"
                    />
                  </UCard>
                </div>
              </UModal>
            </div>
          </div>

        </template>
      </UTable>
      </UCard>
</OuterComponents>
</template>

<style scoped>

</style>