<script setup lang="ts">

const redMatchAlliances: any =  []
const blueMatchAlliances: any = []
const urlNoNum: string = "https://www.thebluealliance.com/api/v3/";
let inputMatch: any;
let assignment = new Map()
async function findAlliances(eventKey: any, matchKey: any){
  let urlFinal: string = urlNoNum + "event/" + eventKey + "/matches";
  let grab: any;
  grab = await fetch(urlFinal, {
    method: 'GET',
    headers: {
      'X-TBA-Auth-Key': "JBP0wpGwe79xWOVzDXWFKxgmFhZEmrIgVluq3PZf4z9OVcvROKTjnTrRu7D9rsUz"
    }
  });
  grab = await grab.json();
  for (let i in grab[matchKey].alliances.red.team_keys){
    redMatchAlliances.push(grab[matchKey].alliances.red.team_keys[i])
  }
  for (let i in grab[matchKey].alliances.blue.team_keys){
    blueMatchAlliances.push(grab[matchKey].alliances.blue.team_keys[i])
  }
}



async function dataPull(entry: any): Promise<any>{
  let refNum: any = entry;
  let urlNoNum: string = "https://www.thebluealliance.com/api/v3/";
  let urlFinal: string = urlNoNum + "event/" + refNum + "/teams/simple";
  let grab: any;
  grab = await fetch(urlFinal, {
    method: 'GET',
    headers: { // TODO: eventually conceal this by doing it on server side
      'X-TBA-Auth-Key': "JBP0wpGwe79xWOVzDXWFKxgmFhZEmrIgVluq3PZf4z9OVcvROKTjnTrRu7D9rsUz"
    }
  });
  grab = await grab.json();
  let teamList: any = []
  for (let i in grab){
    teamList.push(grab[i].team_number)
  }
  console.log(teamList.toString())
  return;
}

async function openAssign(eventKey2: any, matchKey2: any){
  await findAlliances(eventKey2, matchKey2)
  assignment.set(redMatchAlliances[0], null)
  assignment.set(redMatchAlliances[1], null)
  assignment.set(redMatchAlliances[2], null)
  assignment.set(blueMatchAlliances[0], null)
  assignment.set(blueMatchAlliances[1], null)
  assignment.set(blueMatchAlliances[2], null)
  console.dir(assignment)

}

</script>

<template>
  <OuterComponents>
    <UButton @click="dataPull(inputMatch)">Search Teams</UButton>
    <UButton @click="findAlliances(inputMatch, 1)">Setup Screen</UButton>
    <UButton @click="openAssign(inputMatch, 1)"></UButton>
    <UInput v-model="inputMatch" placeholder="Match Number"></UInput>
    <UInput v-for="i in assignment" v-model="assignment[i]" placeholder="Scouter for {{assignment[i]}}"></UInput>
  </OuterComponents>
</template>

<style scoped>

</style>