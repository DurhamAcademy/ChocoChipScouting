<script setup lang="ts">

import databases from "~/utils/databases";
import {eventOptions} from "~/utils/eventOptions";

let currentEvent = eventOptions[0]
if (typeof window !== 'undefined') currentEvent = localStorage.getItem('currentEvent') || eventOptions[0]

const fetch = useFetch<Array<any>>("/api/eventMatches/" + currentEvent)


const { scoutingData } = databases.locals
let db = scoutingData

const matches = (await db.allDocs()).rows
let match = matches.map(async (doc) => {
  return await db.get(doc.id)
})

let teamOrgMatches = new Map<number, Array<any>>()

for(let i  = 0; i < match.length; i++){
  let currentMatch = (await match[i])
  let team = typeof currentMatch.teamNumber == "string" ? parseInt(currentMatch.teamNumber): currentMatch.teamNumber
  if(currentMatch.event == currentEvent) {
    if (!teamOrgMatches.has(team)) {
      teamOrgMatches.set(team, [currentMatch])
    } else {
      let arr: Array<any> = teamOrgMatches.get(team)!
      arr.push(currentMatch)
      teamOrgMatches.set(team, arr)
    }
  }
}
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


let selectedBlueTeams = ref<Array<string>>(["", "", ""])
let selectedRedTeams = ref<Array<string>>(["", "", ""])

let winningTeamColor = ref("")
let winningPercentage = ref(50)

function calculateTeamAverageScore(team:number){
  let teamMatches = teamOrgMatches.get(team)
  if(teamMatches){
    let totalScore = 0
    for(let match of teamMatches){
      totalScore += scoreMatch(match)
    }
    return totalScore/teamMatches.length
  }
  return -1
}

let teamsFound = ref([[false, false, false], [false, false, false]])

function predict(){
  let blueTotal = 0
  let redTotal = 0
  for(let team of selectedBlueTeams.value){
    let teamNum = parseInt(team)
    let score = 0
    teamsFound.value[0][selectedBlueTeams.value.indexOf(team)] = false
    if(!Number.isNaN(teamNum))
      score += calculateTeamAverageScore(teamNum)
    if(score > 0)
      blueTotal += score
    else if(score == -1){
      teamsFound.value[0][selectedBlueTeams.value.indexOf(team)] = true
    }
  }
  for(let team of selectedRedTeams.value){
    let teamNum = parseInt(team)
    let score = 0
    teamsFound.value[1][selectedRedTeams.value.indexOf(team)] = false
    if(!Number.isNaN(teamNum))
      score = calculateTeamAverageScore(teamNum)
    if(score > 0)
      redTotal += score
    else if(score == -1){
      teamsFound.value[1][selectedRedTeams.value.indexOf(team)] = true
    }
  }

  let blueWinPercentage = blueTotal/(blueTotal+redTotal) * 100
  if(blueWinPercentage > 50){
    winningTeamColor.value = "bg-blue-100 rounded-lg"
    winningPercentage.value = blueWinPercentage
  }
  else if(blueWinPercentage < 50){
    winningTeamColor.value = "bg-red-100 rounded-lg"
    winningPercentage.value = 100 - blueWinPercentage
  }
  else{
    winningTeamColor.value = ""
    winningPercentage.value = blueWinPercentage
  }
}

let matchNumber = ref<number>()
let playoffNumber = ref<number>()

function populateMatch(){
  let tbaMatchData = fetch.data.value
  if(matchNumber.value != undefined && matchNumber.value.toString() != '') {
    if (tbaMatchData != null) {
      for (let compMatch of tbaMatchData) {
        if (compMatch.comp_level == "qm" && compMatch.match_number == matchNumber.value) {
          for (let i = 0; i < compMatch.alliances.blue.team_keys.length; i++) {
            selectedBlueTeams.value[i] = compMatch.alliances.blue.team_keys[i].replace("frc", "")
          }
          for (let i = 0; i < compMatch.alliances.red.team_keys.length; i++) {
            selectedRedTeams.value[i] = compMatch.alliances.red.team_keys[i].replace("frc", "")
          }
        }
      }
    }
  }
  else if(playoffNumber.value != undefined){
    if (tbaMatchData != null) {
      for (let compMatch of tbaMatchData) {
        if (compMatch.comp_level == "sf" && compMatch.set_number == playoffNumber.value) {
          for (let i = 0; i < compMatch.alliances.blue.team_keys.length; i++) {
            selectedBlueTeams.value[i] = compMatch.alliances.blue.team_keys[i].replace("frc", "")
          }
          for (let i = 0; i < compMatch.alliances.red.team_keys.length; i++) {
            selectedRedTeams.value[i] = compMatch.alliances.red.team_keys[i].replace("frc", "")
          }
        }
      }
    }
  }
}
let totalMatches = ref(0)
let correctMatches = ref(0)

let md = fetch.data.value
if(md != null) {
  for (let compMatch of md) {
    if (compMatch.comp_level == "qm") {
      for (let i = 0; i < compMatch.alliances.blue.team_keys.length; i++) {
        selectedBlueTeams.value[i] = compMatch.alliances.blue.team_keys[i].replace("frc", "")
      }
      for (let i = 0; i < compMatch.alliances.red.team_keys.length; i++) {
        selectedRedTeams.value[i] = compMatch.alliances.red.team_keys[i].replace("frc", "")
      }
      predict()
      console.log(winningTeamColor.value)
      if(winningTeamColor.value == "bg-blue-100 rounded-lg"){
        if(compMatch.winningAlliance == "blue"){
          correctMatches.value++
        }
      }
      else if(winningTeamColor.value == "bg-red-100 rounded-lg"){
        if(compMatch.winningAlliance == "red"){
          correctMatches.value++
        }
      }
      totalMatches.value++
    }
  }
}

</script>

<template>
  <OuterComponents>
    <div class="flex justify-center">
      <UCard class="max-w-xl mt-5 flex-grow">
        <template #header>
          <div class="flex">
            <UInput v-model="matchNumber" class="flex-auto" placeholder="Match #"></UInput>
            <UInput v-model="playoffNumber" class="flex-auto ml-2.5" placeholder="Playoff #"></UInput>
            <UButton class="ml-2.5 flex-0" label="Auto Fill" @click="populateMatch"></UButton>
            <UButton class="ml-2.5 flex-1" label="Predict" @click="predict"></UButton>
          </div>
        </template>
        <UContainer class="flex bg-blue-100 p-5">
          <UInput v-model="selectedBlueTeams[0]" class="flex-1" placeholder="Team #">
            <template #trailing>
              <span v-if="teamsFound[0][0]" class="text-red-400 dark:text-red-600 text-xs">not found</span>
            </template>
          </UInput>
          <UInput v-model="selectedBlueTeams[1]" class="flex-1 ml-2.5" placeholder="Team #">
            <template #trailing>
              <span v-if="teamsFound[0][1]" class="text-red-400 dark:text-red-600 text-xs">not found</span>
            </template>
          </UInput>
          <UInput v-model="selectedBlueTeams[2]" class="flex-1 ml-2.5" placeholder="Team #">
            <template #trailing>
              <span v-if="teamsFound[0][2]" class="text-red-400 dark:text-red-600 text-xs">not found</span>
            </template>
          </UInput>
        </UContainer>
        <UContainer class="flex bg-red-100 p-5">
          <UInput v-model="selectedRedTeams[0]" class="flex-1" placeholder="Team #">
            <template #trailing>
              <span v-if="teamsFound[1][0]" class="text-red-400 dark:text-red-600 text-xs">not found</span>
            </template>
          </UInput>
          <UInput v-model="selectedRedTeams[1]" class="flex-1 ml-2.5" placeholder="Team #">
            <template #trailing>
              <span v-if="teamsFound[1][1]" class="text-red-400 dark:text-red-600 text-xs">not found</span>
            </template>
          </UInput>
          <UInput v-model="selectedRedTeams[2]" class="flex-1 ml-2.5" placeholder="Team #">
            <template #trailing>
              <span v-if="teamsFound[1][2]" class="text-red-400 dark:text-red-600 text-xs">not found</span>
            </template>
          </UInput>
        </UContainer>
        <template #footer>
          <UContainer :class="winningTeamColor">
            <div class="text-center">
              <p class="font-semibold">{{winningPercentage.toFixed(2)}}</p>
              <p>{{correctMatches.toString() + totalMatches.toString()}}</p>
            </div>
          </UContainer>
        </template>
      </UCard>
    </div>
  </OuterComponents>
</template>

<style scoped>

</style>