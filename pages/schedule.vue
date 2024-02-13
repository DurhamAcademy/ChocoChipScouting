<script setup lang="ts">

const redMatchAlliances: any =  ref([])
const blueMatchAlliances: any = ref([])
const urlNoNum: string = "https://www.thebluealliance.com/api/v3/";
let inputMatch: any;
let assignment = ref(new Map())

/**
 * gets alliances in match from TBA API and creates an array for blue and another for red
 * @param eventKey event key in format (year)(event code)
 * @param matchKey match number, starts at 0 because of index
 */
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
    redMatchAlliances.value.push(grab[matchKey].alliances.red.team_keys[i])
  }
  for (let i in grab[matchKey].alliances.blue.team_keys){
    blueMatchAlliances.value.push(grab[matchKey].alliances.blue.team_keys[i])
  }
}


/**
 * lists teams in event from TBA API
 * @param entry event key in format (year)(event code)
 */
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

/**
 * puts the teams into a map to have a scouter assigned (parameters same as findAlliances())
 * @param eventKey2 event key in format (year)(event code)
 * @param matchKey2 match number starting at 0 because of indexing
 */
async function openAssign(eventKey2: any, matchKey2: any){
  await findAlliances(eventKey2, matchKey2)
  assignment.value.set(redMatchAlliances.value[0], null)
  assignment.value.set(redMatchAlliances.value[1], null)
  assignment.value.set(redMatchAlliances.value[2], null)
  assignment.value.set(blueMatchAlliances.value[0], null)
  assignment.value.set(blueMatchAlliances.value[1], null)
  assignment.value.set(blueMatchAlliances.value[2], null)
  console.dir(assignment.value)
}

</script>

<template>
  <OuterComponents>
    <UButton @click="dataPull(inputMatch)">Search Teams</UButton>
    <UButton @click="findAlliances(inputMatch, 1)">Setup Screen</UButton>
    <UButton @click="openAssign(inputMatch, 1)">Create Assignments</UButton>
    <UButton @click="console.dir(assignment)">Check Assignment</UButton>
    <UInput v-model="inputMatch" placeholder="Match Number"></UInput>
    <li v-for="item in assignment">
      <div>
        <UInput v-model="assignment[item]" placeholder="{{assignment[item]}}"> </UInput>
        <UButton @click="assignment.set(assignment[item], 'hello')">Assign Yourself</UButton>
      </div>
    </li>
  </OuterComponents>
</template>

<style scoped>

</style>