<script setup lang="ts">
import databases from "~/utils/databases";


const { scoutingData } = databases.locals
let db = scoutingData

const matches = (await db.allDocs()).rows
let match = matches.map(async (doc) => {
  return await db.get(doc.id)
})

let teamOrgMatches = new Map<number, Array<any>>()

for(let i  = 0; i < match.length; i++){
  let currentMatch = (await match[i])
  if(!teamOrgMatches.has(currentMatch.teamNumber))
    teamOrgMatches.set(currentMatch.teamNumber, [currentMatch])
  else
    teamOrgMatches.get(currentMatch.teamNumber)!.push(currentMatch)
}

let teamsData : Array<any> = []

for(let [key, value] of teamOrgMatches){
  compileEndgames(value)
  let arr = {team: key, amp:getAverageAmpCycles(value), speaker:getAverageSpeakerCycles(value), endgame:compileEndgames(value)}
  teamsData.push(arr)
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

function compileEndgames(teamArrays: Array<any>){
  let endgameMap = new Map<string, number>();
  for(let i = 0; i < teamArrays.length; i++){
    let endgame = ""
    teamArrays[i].endgame.endgame.forEach(function (value: Array<string>) {
      endgame += endgame == "" ? value: " & " + value
    })
    if(endgameMap.has(endgame)) {
      endgameMap.set(endgame, endgameMap.get(endgame)! + 1)
    }
    else
        endgameMap.set(endgame, 1)
  }
  let total = 0
  for(let [, value] of endgameMap){
    total += value
  }
  endgameMap.forEach(function(value, key){
    endgameMap.set(key, value/total)
  })
  return endgameMap
}

const columns = [{
  key: 'team',
  label: 'Team #'
}, {
  key: 'amp',
  label: 'Average Amp Cycles'
}, {
  key: 'speaker',
  label: 'Average Speaker Cycles'
}, {
  key: 'actions'
}]


</script>

<template>
<Navbar></Navbar>
  <UTable :rows="teamsData" :columns="columns">
    <template #actions-data="{ row }">
      <p>{{row.endgame}}</p>
    </template>
  </UTable>
</template>

<style scoped>

</style>