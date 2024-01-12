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

console.log(teamOrgMatches)

let teamsData : Array<Array<any>> = []

for(let [key, value] of teamOrgMatches){
  let arr = [key, getAverageAmpCycles(value), getAverageSpeakerCycles(value)]
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


</script>

<template>
<Navbar></Navbar>
  <UTable :rows="teamsData" />
</template>

<style scoped>

</style>