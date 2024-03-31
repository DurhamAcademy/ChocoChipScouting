<script setup lang="ts">

const props = defineProps<{
  rowData: any,
}>()

props.rowData.rawData.sort(compareMatchNumbers)

function compareMatchNumbers(a: any, b: any){
  //TODO i hate this work around rly need to fix this
  let matchA = typeof a.matchNumber == "string" ? parseInt(a.matchNumber): a.matchNumber
  let matchB = typeof b.matchNumber == "string" ? parseInt(b.matchNumber): b.matchNumber
  if (matchA < matchB) {
    return -1;
  }
  if (matchA > matchB) {
    return 1;
  }
  return 0;
}


let matchNums = ref<Array<number>>([])
let autoMatchScores = ref<Array<number>>([])
let matchScores = ref<Array<number>>([])
let missedScores = ref<Array<number>>([])

for(let match of props.rowData.rawData){
  matchNums.value.push(match.matchNumber)
  //TODO backwards compatability
  missedScores.value.push((match.auto.missedAmp + match.auto.missedSpeaker) || 0)
  autoMatchScores.value.push(match.auto.amp)
  matchScores.value.push(match.teleop.amp + match.auto.amp)
}

const chartTitles = ["Total", "Auto", "Missed"]

let columns = [{
  key: 'period',
  label: 'Game Period'
},{
  key: 'min',
  label: 'Min',
},{
  key: 'max',
  label: 'Max',
},{
  key: 'avg',
  label: 'Avg',
}]

function getAmpStats(){
  let maxAuto = 0
  let minAuto = null
  let totalAuto = 0

  let maxTeleop = 0
  let minTeleop = null
  let totalTeleop = 0
  for(let match of props.rowData.rawData){
    if(match.auto.amp > maxAuto) maxAuto = match.auto.amp
    if(match.teleop.amp > maxTeleop) maxTeleop = match.teleop.amp

    if(minAuto == null || minAuto > match.auto.amp) minAuto = match.auto.amp
    if(minTeleop == null || minTeleop > match.teleop.amp) minTeleop = match.teleop.amp

    totalAuto += match.auto.amp
    totalTeleop += match.teleop.amp
  }
  return [minAuto, maxAuto, totalAuto/props.rowData.rawData.length, minTeleop, maxTeleop, totalTeleop/props.rowData.rawData.length]
}
let ampStats = getAmpStats().map((value) => value.toFixed(2))

let rows = [{
  period: 'Auto',
  min: ampStats[0],
  max: ampStats[1],
  avg: ampStats[2]
}, {
    period: 'Teleop',
    min: ampStats[3],
    max: ampStats[4],
    avg: ampStats[5]
}]

</script>

<template>
  <UCard>
    <div class="flex flex-auto width=device-width flex-wrap">
      <LineChart
          class="mr-5"
          :data="[matchScores, autoMatchScores, missedScores]"
          :labels="matchNums"
          :chart-titles="chartTitles"
          :suggested-max="20"
          height="h-64"
          width="w-64"
      ></LineChart>
      <div class="flex-auto whitespace-normal">
        <div class="font-semibold underline underline-offset-2 mb-1 w-full text-center">
          <h1>Amp</h1>
        </div>
        <UTable :rows="rows" :columns="columns"/>
      </div>
    </div>
  </UCard>
</template>