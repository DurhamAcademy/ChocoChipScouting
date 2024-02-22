<script setup lang="ts">
import databases from "~/utils/databases"
const { scheduleData } = databases.locals

let db = scheduleData

db.info().then(async function (result) {
  if (result.doc_count === 0) {
    let teams = await findAlliances(window.localStorage.getItem("event"))
    for(let i=0; i<teams.length; i++) {
      let res = {
        event: window.localStorage.getItem("event"),
        teams: teams[i],
        assignees: {red1: null, red2: null, red3: null, blue1: null, blue2: null, blue3: null}
      }
      await db.post(res)
    }
  }
})

const schedul = (await db.allDocs()).rows
let schedu = schedul.map(async (doc) => {
  return await db.get(doc.id)
})
let schedule = await Promise.all(schedu)

let matches = schedule

const urlNoNum: string = "https://www.thebluealliance.com/api/v3/";

/**
 * gets alliances in match from TBA API and creates an array for blue and another for red
 * @param eventKey event key in format (year)(event code)
 */
async function findAlliances(eventKey: any){
  let res = []
  let urlFinal: string = urlNoNum + "event/" + eventKey + "/matches";
  let grab: any;
  grab = await fetch(urlFinal, {
    method: 'GET',
    headers: {
      'X-TBA-Auth-Key': "JBP0wpGwe79xWOVzDXWFKxgmFhZEmrIgVluq3PZf4z9OVcvROKTjnTrRu7D9rsUz"
    }
  });
  grab = await grab.json();
  console.log(grab)
  for(let n=0; n<grab.length; n++) {
    res[n] = {red1: null, red2: null, red3: null, blue1: null, blue2: null, blue3: null}
    let c = 1
    for (let i in grab[n].alliances.red.team_keys) {
      if(c==1) res[n].red1 = grab[n].alliances.red.team_keys[i].substring(3)
      else if(c==2) res[n].red2 = grab[n].alliances.red.team_keys[i].substring(3)
      else res[n].red3 = grab[n].alliances.red.team_keys[i].substring(3)
      c++
    }
    c = 1
    for (let i in grab[n].alliances.blue.team_keys) {
      if(c==1) res[n].blue1 = grab[n].alliances.blue.team_keys[i].substring(3)
      else if(c==2) res[n].blue2 = grab[n].alliances.blue.team_keys[i].substring(3)
      else res[n].blue3 = grab[n].alliances.blue.team_keys[i].substring(3)
      c++
    }
  }
  return res
}

let red1_assignee = ""
let red2_assignee = ""
let red3_assignee = ""
let blue1_assignee = ""
let blue2_assignee = ""
let blue3_assignee = ""
/**
 * Updates database using db.put
 * @param num number of which team assignee to update, 1 is red1 and 6 is blue3
 * @param id the id of the doc
 */
async function signUp(num: any, id: string) {
  try {
    var doc = await db.get(id)
    console.log(doc)
    let temp = doc.assignees
    if (num == 1) temp.red1 = red1_assignee
    if (num == 2) temp.red2 = red2_assignee
    if (num == 3) temp.red3 = red3_assignee
    if (num == 4) temp.blue1 = blue1_assignee
    if (num == 5) temp.blue2 = blue2_assignee
    if (num == 6) temp.blue3 = blue3_assignee
    var response = await db.put({
      _id: id,
      _rev: doc._rev,
      event: window.localStorage.getItem("event"),
      teams: doc.teams,
      assignees: temp
    })
    console.log("a")
  } catch (err) {
    console.log(err)
  }
}

let columns = [
  {
    key: 'teams.red1',
    label: 'Red 1'
  }, {
    key: 'assignees.red1',
    label: ''
  }, {
    key: 'teams.red2',
    label: 'Red 2'
  }, {
    key: 'assignees.red2',
    label: ''
  }, {
    key: 'teams.red3',
    label: 'Red 3'
  }, {
    key: 'assignees.red3',
    label: ''
  }, {
    key: 'teams.blue1',
    label: 'Blue 1'
  }, {
    key: 'assignees.blue1',
    label: ''
  }, {
    key: 'teams.blue2',
    label: 'Blue 2'
  }, {
    key: 'assignees.blue2',
    label: ''
  }, {
    key: 'teams.blue3',
    label: 'Blue 3'
  }, {
    key: 'assignees.blue3',
    label: ''
  }
]
</script>

<template>
  <OuterComponents>
    <UTable :rows="matches" :columns="columns">
      <template #assignees.red1-data="{ row }">
        <div v-if="row.assignees.red1 != null">{{ row.assignees.red1 }}</div>
        <UPopover v-else>
          <UButton>Sign up</UButton>
          <template #panel>
            <UCard class="max-w-xl flex-grow m-5">
              <div class="whitespace-normal break-all">Sign up thing</div>
              <UInput v-model="red1_assignee" class="p-1" placeholder="Name"></UInput>
              <UButton @click="signUp(1, row._id)">Sign up</UButton>
            </UCard>
          </template>
        </UPopover>
      </template>
    </UTable>
  </OuterComponents>
</template>

<style scoped>

</style>