<script setup lang="ts">
import databases from "~/utils/databases";
import Sentiment from 'sentiment';

let openAttachments = ref(false)

let sentiment = new Sentiment()
let options = {
  extras: {
    'mid': -2,
    'pretty': 0,
    'broke': -3.5,
    'disabled': -3.5,
    'quickly': 2,
    'easily': 2
  }
}

const { scoutingData } = databases.locals
let db = scoutingData

const matches = (await db.allDocs()).rows
let match = matches.map(async (doc) => {
  return await db.get(doc.id)
})

let teamOrgMatches = new Map<number, Array<any>>()

for(let i  = 0; i < match.length; i++){
  let currentMatch = (await match[i])
  if(currentMatch.event == window.localStorage.getItem("event") || window.localStorage.getItem("event") == null) {
    if (!teamOrgMatches.has(currentMatch.teamNumber))
      teamOrgMatches.set(currentMatch.teamNumber, [currentMatch])
    else
      teamOrgMatches.get(currentMatch.teamNumber)!.push(currentMatch)
  }
}

let teamsData : Array<any> = []

//key => team number
//value => array of match data
for(let [key, value] of teamOrgMatches){
  let arr = {team: key, amp:getAverageAmpCycles(value).toFixed(2), speaker:getAverageSpeakerCycles(value).toFixed(2), mobility:averageAuto(value).toFixed(2), sentiment: analyzeNotes(value).toFixed(2), endgame:compileEndgames(value)}
  teamsData.push(arr)
}

function analyzeNotes(teamArrays: Array<any>){
  let analysisTotal = 0
  for(let match of teamArrays){
    analysisTotal += sentiment.analyze(match.notes.notes, options).score
    console.dir(sentiment.analyze(match.notes.notes, options))
  }
  return analysisTotal/teamArrays.length
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

async function view(teamNum: number) {
  window.open(window.location.href+"/"+teamNum)
  openAttachments.value = true
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
  key: 'sentiment',
  label: 'Sentiment Analysis'
}, {
  key: 'attachments',
  label: 'Attachments'
}, {
  key: 'dropdown'
}]


</script>

<template>
<OuterComponents>
    <UTable :rows="teamsData" :columns="columns">
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

        <template #attachments-data="{ row }">
          <UButton @click="view(row.team)" :label="'View Attachments For ' + row.team" variant="soft" color="yellow"/>
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
</OuterComponents>
</template>

<style scoped>

</style>