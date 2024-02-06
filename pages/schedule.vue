<script setup lang="ts">
async function dataPull(entry: any): Promise<any>{
  let refNum: any = entry;
  let urlNoNum: string = "https://www.thebluealliance.com/api/v3/";
  let urlFinal: string = urlNoNum + "event/" + refNum + "/teams/simple";
  let grab: any;
  grab = await fetch(urlFinal, {
    method: 'GET',
    headers: {
      'X-TBA-Auth-Key': "JBP0wpGwe79xWOVzDXWFKxgmFhZEmrIgVluq3PZf4z9OVcvROKTjnTrRu7D9rsUz"
    }
  });
  grab = await grab.json();
  let teamList: any = []
  for (let i in grab){
    let withFRC: any = grab[i].key;
    let unFRC: any = withFRC.slice(3)
    teamList.push(unFRC)
  }
  console.log(teamList.toString())
  return;
}
let inputMatch: any;
</script>

<template>
<u-button @click="dataPull(inputMatch)">hello world</u-button>
  <u-input v-model="inputMatch" placeholder="Match Number"></u-input>
</template>

<style scoped>

</style>