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
  if(!teamOrgMatches.has(currentMatch.team)) {
    teamOrgMatches.set(currentMatch.team, [currentMatch])
  }
  else
    teamOrgMatches.get(currentMatch.team)!.push(currentMatch)
}

console.log(teamOrgMatches.get(6502)![0].ConeHigh)

</script>

<template>
<Navbar></Navbar>
</template>

<style scoped>

</style>