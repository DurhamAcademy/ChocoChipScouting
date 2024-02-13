<script setup lang="ts">
import databases from "~/utils/databases"

/*
Steps:
1. get data from database
  i.
2. display data
 */

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

// TODO: @26ru do some manipulation do get matches array to work
let matches = [
  {
    red1: {team: 100, assignee: ""},
    red2: {team: 1000, assignee: ""},
    red3: {team: 1001, assignee: ""},
    blue1: {team: 200, assignee: ""},
    blue2: {team: 2000, assignee: ""},
    blue3: {team: 2002, assignee: ""}
  }, {
    red1: {team: 300, assignee: ""},
    red2: {team: 3000, assignee: ""},
    red3: {team: 3003, assignee: ""},
    blue1: {team: 400, assignee: ""},
    blue2: {team: 4000, assignee: ""},
    blue3: {team: 4004, assignee: ""}
  }
]

let columns = [
  {
    key: 'red1',
    label: 'Red 1'
  }, {
    key: 'red2',
    label: 'Red 2'
  }, {
    key: 'red3',
    label: 'Red 3'
  }, {
    key: 'blue1',
    label: 'Blue 1'
  }, {
    key: 'blue2',
    label: 'Blue 2'
  }, {
    key: 'blue3',
    label: 'Blue 3'
  }
]

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
    <u-button @click="dataPull(inputMatch)">hello world</u-button>
    <u-input v-model="inputMatch" placeholder="Match Number"></u-input>
    <UTable :rows="matches" :columns="columns">
      <template #red1-data="{ row }">
        <div class="flex">
          {{ row.red1.team }}
          <div style="padding-left: 100px">
            <UTextarea :rows="1" ></UTextarea>
          </div>
        </div>
      </template>
    </UTable>
  </OuterComponents>
</template>

<style scoped>

</style>