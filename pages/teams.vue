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
  let arr = {team: key, amp:getAverageAmpCycles(value).toFixed(2), speaker:getAverageSpeakerCycles(value).toFixed(2), mobility:averageAuto(value).toFixed(2), endgame:compileEndgames(value)}
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

function averageAuto(teamArrays: Array<any>){
  let successfulMobilityCount = 0
  for(let match of teamArrays){
    successfulMobilityCount += match.auto.leave ? 1 : 0
  }
  return successfulMobilityCount/teamArrays.length
}

function compileEndgames(teamArrays: Array<any>){
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
  key: 'mobility',
  label: 'Mobility Success Rate'
}, {
  key: 'actions',
  label: 'Endgame'
}, {
  key: 'dropdown'
}]


</script>

<template>
<Navbar></Navbar>
  <UTable :rows="teamsData" :columns="columns">

    <template #amp-data="{ row }">
      <UPopover>
        <UButton class="m-1" color="white" variant="soft" >{{row.amp}}</UButton>
        <template #panel>
          <UCard>
            <div class="max-w-xs min-w-[15rem] overflow-y-auto" style="max-height: 20rem; min-height: 10rem">

            </div>
          </UCard>
        </template>
      </UPopover>
    </template>

    <template #mobility-data="{ row }">
      <UPopover>
        <UButton class="m-1" color="white" variant="soft" >{{row.mobility}}</UButton>
        <template #panel>
          <UCard>
            <div class="max-w-xs min-w-[15rem] overflow-y-auto" style="max-height: 20rem; min-height: 10rem">

            </div>
          </UCard>
        </template>
      </UPopover>
    </template>

    <template #speaker-data="{ row }">
      <UPopover>
        <UButton class="m-1" color="white" variant="soft" >{{row.speaker}}</UButton>
        <template #panel>
          <UCard>
            <div class="max-w-xs min-w-[15rem] overflow-y-auto" style="max-height: 20rem; min-height: 10rem">

            </div>
          </UCard>
        </template>
      </UPopover>
    </template>

    <template #actions-data="{ row }">
      <UPopover>
        <UButton class="m-1" color="blue" label="Chart" variant="soft" />
        <template #panel>
          <UCard>
            <div class="max-w-xs min-w-[15rem] overflow-y-auto" style="max-height: 20rem; min-height: 10rem">
              <PieChart :labels="row.endgame[0]" :data="row.endgame[1]"/>
            </div>
          </UCard>
        </template>
      </UPopover>
    </template>

    <template #dropdown-data="{ row }">
      <UPopover>
        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        <template #panel>
          <UCard>
            <div class="max-w-full min-w-max overflow-y-auto" style="max-height: 20rem; min-height: 10rem">

            </div>
          </UCard>
        </template>
      </UPopover>
    </template>

  </UTable>
</template>

<style scoped>

</style>