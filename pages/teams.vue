<script setup lang="ts">
import databases from "~/utils/databases";
import {emit} from "pouchdb";

const { scoutingData } = databases.locals
let db = scoutingData

const matches = (await db.allDocs()).rows
let match = matches.map(async (doc) => {
  return await db.get(doc.id)
})

let mp = new Map<number, Array<{team: number} & PouchDB.Core.IdMeta & PouchDB.Core.GetMeta>[]>();

for(let i = 0; i < match.length; i++){
  let matchInfo = (await match[i])
  if(mp.has(matchInfo.team)){
    //mp.set(matchInfo.team, mp.get(matchInfo.team).push(matchInfo))
  }

}

</script>

<template>
<Navbar></Navbar>
</template>

<style scoped>

</style>