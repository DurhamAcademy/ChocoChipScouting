<script setup lang="ts">


const matchAlliances: any = {red: [], blue: []}

const urlNoNum: string = "https://www.thebluealliance.com/api/v3/";
async function findAlliances(eventKey: any, matchKey: any){
  let urlFinal: string = urlNoNum + "team/frc6502/event/" + eventKey + "/matches";
  let grab: any;
  grab = await fetch(urlFinal, {
    method: 'GET',
    headers: {
      'X-TBA-Auth-Key': "JBP0wpGwe79xWOVzDXWFKxgmFhZEmrIgVluq3PZf4z9OVcvROKTjnTrRu7D9rsUz"
    }
  });
  grab = await grab.json();
  console.log(grab[matchKey].alliances.blue.team_keys[1])
  for (let i in grab[matchKey].alliances.red.team_keys){
    console.log(i)
    matchAlliances.red.push(grab[matchKey].alliances.red.team_keys[i])
  }
  for (let i in grab[matchKey].alliances.blue.team_keys){
    matchAlliances.blue.push(grab[matchKey].alliances.blue.team_keys[i])
  }
  console.dir(matchAlliances)
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
  // TODO: @26spitzer maybe do some mapping? also you can use .team_number instead of .key
  for (let i in grab){
    teamList.push(grab[i].team_number)
  }
  console.log(teamList.toString())
  return;
}
let inputMatch: any;
</script>

<template>
  <OuterComponents>
    <u-button @click="dataPull(inputMatch)">Search Teams</u-button>
    <u-button @click="findAlliances(inputMatch, 1)">Setup Screen</u-button>
    <u-input v-model="inputMatch" placeholder="Match Number"></u-input>
  </OuterComponents>
</template>

<style scoped>

</style>