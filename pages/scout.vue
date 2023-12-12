<script lang="ts" setup>
import databases from "~/utils/databases"
//import {integer} from "vscode-languageserver-types";
import IncrementalButton from '~/components/IncrementalButton.vue'
import {UnwrapRef} from "vue";

const { scoutingData } = databases.locals
let db = scoutingData


enum GameTime {
  Autonomous = "Auto",
  Teleoperated = "Teleop",
  Endgame = "Endgame"
}
let gameTime = ref(GameTime.Autonomous)

const endgames = ["None", "Parked", "Docked", "Docked & Engaged"];
let selectedIndex = 0
/*
async function dataPull(team: integer): Promise<any>{
  let refNum: integer = team;
  let urlNoNum: string = "https://www.thebluealliance.com/api/v3/frc";
  let urlFinal: string = urlNoNum + refNum.toString();
  let grab: any;
  grab = await fetch(urlFinal);
  grab = await grab.json();
  let grabParse: any;
  grabParse = JSON.parse(grab);
  return grabParse.nickname;
}
*/
function editGameTime(direction: String) {
  if(direction.localeCompare("+") == 0){
    switch (gameTime.value) {
      case GameTime.Autonomous:
        gameTime.value = GameTime.Teleoperated;
        break;
      case GameTime.Teleoperated:
        gameTime.value = GameTime.Endgame;
        break
      case GameTime.Endgame:
        gameTime.value = GameTime.Autonomous;
        break
    }
  }
  else if(direction.localeCompare("-") == 0)
    {
      switch (gameTime.value) {
        case GameTime.Autonomous:
          gameTime.value = GameTime.Endgame;
          break;
        case GameTime.Teleoperated:
          gameTime.value = GameTime.Autonomous;
          break;
        case GameTime.Endgame:
          gameTime.value = GameTime.Teleoperated;
          break;
      }
    }
}

const notesOpen = ref(false)


/*const ph: any = dataPull(info.teamNum)();
let parsed = JSON.parse(await ph);
let impData = {
  nickname: parsed.nickname,
  */


let data = ref({
  TeamNumber: null,
  MatchNumber: null,
  points: 0,
  ConeHigh: 0,
  ConeMid: 0,
  ConeLow: 0,
  CubeHigh: 0,
  CubeMid: 0,
  CubeLow: 0,
  endgame: endgames[0],
  notes: "",
})

function isValidNum() {
  return (data.value.TeamNumber != null) && (data.value.MatchNumber != null) && (data.value.TeamNumber > 0) && (data.value.MatchNumber > 0) && (data.value.TeamNumber < 10000)
}

async function submit() {

    let newDoc = db.post(data.value)
    await navigateTo("matches")


}

/* Good-looking square buttons but don't work horizontally why?
<UButton label="Docked & Engaged" style="aspect-ratio : 1 / 1; max-width: 75px; max-height: 75px;" class="m-1.5"/>
        <UButton label="Docked" style="aspect-ratio : 1 / 1; max-width: 75px; max-height: 75px;" class="m-1.5"/>
 */
</script>

<template>
  <Navbar scout-mode></Navbar>
  <div class="flex justify-center">
  <UCard class="max-w-xl flex-grow m-5 ">
    <template #header>
      <UButtonGroup class="flex">
        <UButton :disabled="gameTime==GameTime.Autonomous" icon="i-heroicons-chevron-left"
                 @click="editGameTime('-')"/>
        <UButton :label="gameTime.valueOf()" block class="w-auto" disabled style="flex-grow: 1;"/>
        <UButton :disabled="gameTime==GameTime.Endgame" icon="i-heroicons-chevron-right" @click="editGameTime('+')"/>
      </UButtonGroup>
    </template>

    <UInput v-model="data.TeamNumber" placeholder="Team #"></UInput>
    <UInput v-model="data.MatchNumber" placeholder="Match #"></UInput>
    <div v-if="isValidNum()">
      <p>Ready</p>
    </div>
    <div v-else-if="(data.TeamNumber==null)||(data.MatchNumber==null)">
    </div>
    <div v-else>
      <p>Invalid Team/Match Number</p>
    </div>
    <div v-if="gameTime == GameTime.Autonomous">

      </div>
      <div v-if="gameTime == GameTime.Teleoperated">
        <div class="w-1/2" id="cone-div" style="text-align:center; display:inline-block">
          <h1 class="mb-2.5">Cone</h1>
        <IncrementalButton v-model="data.ConeHigh"/>
          <br/>
        <IncrementalButton v-model="data.ConeMid"/>
          <br/>
        <IncrementalButton v-model="data.ConeLow"/>

        </div>
      </div>
      <div v-if="gameTime == GameTime.Endgame">
        <SingleSelect :model-value="selectedIndex" @update:model-value="index => {data.endgame = endgames[index]; selectedIndex = index}" :options="endgames"></SingleSelect>
      </div>
      <template #footer>
        <div class="flex justify-between">
          <div>
            <UButton class="m-1" color="rose" label="Cancel" to="/dashboard" type="reset" variant="outline"/>
            <UButton class="m-1" color="green" label="Submit" type="submit" variant="solid" :disabled="!isValidNum()" @click="submit"/>
          </div>
          <UButton class="m-1" color="yellow" label="Notes" variant="soft" @click="notesOpen = !notesOpen"/>
        </div>
      </template>
    </UCard>
    <USlideover v-model="notesOpen" side="right">
      <UCard class="flex flex-col h-screen">
        <template #header>
          <div class="flex justify-end">
            <UButton icon="i-heroicons-x-mark-solid" size="xl" @click="notesOpen=false" color="yellow" variant="ghost"/>
          </div>
        </template>
        <div class="overflow-y-scroll">
          <UTextarea v-model="data.notes" color="yellow" size="xl" autoresize/>
        </div>
      </UCard>
    </USlideover>
  </div>
</template>

<style scoped>

</style>