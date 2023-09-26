<script setup lang="ts">

const columns = [{
  key: '_id',
  label: 'ID'
}, {
  key: 'points',
  label: 'Points'
}]
let upDB = new PouchDB(couchDBBaseURL + "/scouting-data")
let db = new PouchDB("scoutingData");
upDB.sync(db, {live: true, retry: true})
const matche = (await db.allDocs()).rows
let matc = matche.map(async (doc) => {
  return await db.get(doc.id)
})
let matches = await Promise.all(matc)
console.log(matches)
</script>
<template>
  <Navbar/>
  <UTable :columns="columns" :rows="matches"/>
</template>
<style scoped>

</style>