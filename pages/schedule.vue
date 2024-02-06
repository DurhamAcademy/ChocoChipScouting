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
</script>

<template>
<u-button @click="dataPull('2016nytr')">hello world</u-button>
</template>

<style scoped>

</style>