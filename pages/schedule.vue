<script setup lang="ts">

/* TODO: @26spitzer store the matches as an array or something
example:
matches = {
  { red: {8429: "insert name here", 4534: "", 6500: ""}, blue: {8738: "", 4561: "", 9042: ""} },
  { ... },
  { ... },
  ...
}
 */
let matches = null

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
    /*
    let withFRC: any = grab[i].key;
    let unFRC: any = withFRC.slice(3)
    teamList.push(unFRC)
     */
    teamList.push(grab[i].team_number)
  }
  console.log(teamList.toString())
  return;
}
let inputMatch: any;
</script>

<template>
  <OuterComponents>
    <u-button @click="dataPull(inputMatch)">hello world</u-button>
    <u-input v-model="inputMatch" placeholder="Match Number"></u-input>
  </OuterComponents>
</template>

<style scoped>

</style>