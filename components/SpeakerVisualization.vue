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

for(let match of props.rowData.rawData){
  matchNums.value.push(match.matchNumber)
  autoMatchScores.value.push(match.auto.speakerNA)
  matchScores.value.push(match.auto.speakerNA + match.teleop.speakerNA + match.teleop.speakerA)
}


const chartTitles = ["Total", "Auto"]

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

function getSpeakerStats(){
  let maxAuto = 0
  let minAuto = null
  let totalAuto = 0

  let maxTeleop = 0
  let minTeleop = null
  let totalTeleop = 0
  for(let match of props.rowData.rawData){
    let matchAuto = match.auto.speakerNA
    let matchTeleop = match.teleop.speakerA + match.teleop.speakerNA
    if(matchAuto > maxAuto) maxAuto = matchAuto
    if(matchTeleop > maxTeleop) maxTeleop = matchTeleop

    if(minAuto == null || minAuto > matchAuto) minAuto = matchAuto
    if(minTeleop == null || minTeleop > matchTeleop) minTeleop = matchTeleop

    totalAuto += matchAuto
    totalTeleop += matchTeleop
  }
  return [minAuto, maxAuto, totalAuto/props.rowData.rawData.length, minTeleop, maxTeleop, totalTeleop/props.rowData.rawData.length]
}
console.log(getSpeakerStats())
let speakerStats = getSpeakerStats().map((value) => value.toFixed(2))

let rows = [{
  period: 'Auto',
  min: speakerStats[0],
  max: speakerStats[1],
  avg: speakerStats[2]
}, {
  period: 'Teleop',
  min: speakerStats[3],
  max: speakerStats[4],
  avg: speakerStats[5]
}]

</script>

<template>
  <UCard>
    <div class="width=device-width flex-auto flex-wrap flex">
      <LineChart
          class="mr-5"
          :data="[matchScores, autoMatchScores]"
          :labels="matchNums"
          :chart-titles="chartTitles"
          :suggested-max="20"
      ></LineChart>
      <div class="flex-auto whitespace-normal">
        <UTable :rows="rows" :columns="columns"/>
      </div>
    </div>
  </UCard>
</template>