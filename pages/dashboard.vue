<script setup lang="ts">

import PouchDB from "pouchdb";
import databases, {type TeamInfo} from "~/utils/databases";
let syncDisable = ref(false)

async function sync(){
  syncDisable.value = true
  await PouchDB.sync(databases.locals.scoutingData, databases.remotes.scoutingData)
  await PouchDB.sync(databases.locals.basic, databases.remotes.basic)
  await PouchDB.sync(databases.locals.attachments, databases.remotes.attachments)
  await PouchDB.sync(databases.locals.teamInfo, databases.remotes.teamInfo)
  syncDisable.value = false
}

updateTeamData()

async function updateTeamData() {
  try {
    let previouslySavedTeamNums: number[] = []
    let {teamInfo: db} = databases.locals
    //gets all the teamsData docs from the database and adds them to one array
    let dbTeams = (await db.allDocs()).rows.map(async (doc): Promise<TeamInfo> => {
      return db.get(doc.id)
    })
    Promise.all(dbTeams).then((teams: Array<TeamInfo>) => {
      previouslySavedTeamNums = teams.map((value) => {
        return value.teamNum
      })
    }).then(async () => {
      //goes through each event and checks if they have any teams that aren't in the db already
      let newTeams: Array<TeamInfo> = []
      for (let event of eventOptions) {
        const {data: tbaEventData} = await useFetch<Array<any>>("/api/eventTeams/" + event)
        if (tbaEventData.value != null) {
          if(tbaEventData.value.hasOwnProperty("Error")) continue
          for (let team of tbaEventData.value) {
            let teamDataObj: TeamInfo = {
              teamNum: parseInt(team.key.replace("frc", '')),
              teamName: team.nickname
            }
            if (previouslySavedTeamNums.includes(teamDataObj.teamNum)) continue
            newTeams.push(teamDataObj)
          }
        }
        else{
          console.error("Ruh roh! There seems to have been an issue")
        }
      }
      if(newTeams.length > 0){
        await db.bulkDocs(newTeams)
      }
    })
  } catch {
    console.error("An error occurred")
  }
}
</script>


<template>
  <OuterComponents>
    <UButton class="ml-3 mt-3" @click="sync" :disabled="syncDisable" :loading="syncDisable">
      Sync Databases
    </UButton>
    <div class="px-5 max-w-2xl min-w-lg flex-grow">
      <LazyUSkeleton class="w-full h-64 my-5"></LazyUSkeleton>
      <LazyUCard class="my-5">
        <div class="m-1 flex flex-wrap">
          <div class="w-1/2 pr-2.5">
            <LazyUSkeleton class="w-full h-32"></LazyUSkeleton>
          </div>
          <div class="w-1/2 pl-2.5">
            <LazyUSkeleton class="w-full h-32"></LazyUSkeleton>
          </div>
          <div class="w-full py-2.5">
            <LazyUSkeleton class="w-full h-16"></LazyUSkeleton>
          </div>
        </div>
      </LazyUCard>
    </div>
  </OuterComponents>
</template>

<style scoped>
</style>