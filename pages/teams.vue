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
  if(!teamOrgMatches.has(currentMatch.team))
    teamOrgMatches.set(currentMatch.team, [currentMatch])
  else
    teamOrgMatches.get(currentMatch.team)!.push(currentMatch)
}

function getConeAverage(teamNum: number){
  let total = 0.0
  for(let i = 0; i < teamOrgMatches.get(teamNum)!.length; i++){
    total += teamOrgMatches.get(teamNum)![i].ConeHigh + teamOrgMatches.get(teamNum)![i].ConeMid + teamOrgMatches.get(teamNum)![i].ConeLow
  }
  return total/teamOrgMatches.get(teamNum)!.length
}

let x = [[teamOrgMatches.get(6502)![0].team, getConeAverage(6502)]]

const columns = [{
  key: "0",
  label: 'TEAM #'
}, {
  key: "1",
  label: 'AVERAGE CONE CYCLES'
}]

</script>

<template>
<Navbar></Navbar>
  <UTable :rows="x" :columns="columns"></UTable>
</template>

<style scoped>

</style>