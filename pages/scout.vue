<script lang="ts" setup>
import databases from "~/utils/databases"
import IncrementalButton from '~/components/IncrementalButton.vue'

const { scoutingData } = databases.locals
let db = scoutingData


enum GameTime {
  Autonomous = "Auto",
  Teleoperated = "Teleop",
  Endgame = "Endgame"
}
let gameTime = ref(GameTime.Autonomous)


const endgameOptions = ["None", "Parked", "Attempted Onstage" , "Onstage", "Harmony"]
let endgameIndex = [1, 0, 0, 0, 0]

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



/*const ph: any = dataPull(info.teamNum)();
let parsed = JSON.parse(await ph);
let impData = {
  nickname: parsed.nickname,
  */


let data = ref({
  teamNumber: null,
  matchNumber: null,
  auto: {
    speakerNA: 0,
    amp: 0,
    leave: false,
  },
  teleop: {
    amp: 0,
    speakerNA: 0,
    speakerA: 0,
  },
  endgame: {
    trap: 0,
    endgame: [endgameOptions[0]]
  },
  notes: "",
})

function updateEndgameOptions(value: Array<number>){
  let arr = []
  for(let i = 0; i < value.length; i++){
    if(value[i] == 1){
      arr.push(endgameOptions[i])
    }
  }
  data.value.endgame.endgame = arr
  if(data.value.endgame.endgame.length < 1){
    data.value.endgame.endgame = [endgameOptions[0]]
  }
}


function isValidNum() {
  return (data.value.teamNumber != null) && (data.value.matchNumber != null) && (data.value.teamNumber > 0) && (data.value.matchNumber > 0) && (data.value.teamNumber < 10000)
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
      <div style="display:flex">
        <div style="flex:1">
          <UInput v-model="data.teamNumber" placeholder="Team #"></UInput>
        </div>
        <div style="flex:1">
          <UInput v-model="data.matchNumber" placeholder="Match #"></UInput>
        </div>
      </div>
      <br>
      <UButtonGroup class="flex">
        <UButton :disabled="gameTime==GameTime.Autonomous" icon="i-heroicons-chevron-left"
                 @click="editGameTime('-')"/>
        <UButton :label="gameTime.valueOf()" block class="w-auto" disabled style="flex-grow: 1;"/>
        <UButton :disabled="gameTime==GameTime.Endgame" icon="i-heroicons-chevron-right" @click="editGameTime('+')"/>
      </UButtonGroup>
    </template>
        <div v-if="gameTime == GameTime.Autonomous">
          <div style="text-align:center">
            <IncrementalButton v-model="data.auto.amp"></IncrementalButton>
            <IncrementalButton v-model="data.auto.speakerNA"></IncrementalButton>
          </div>
          <br>
          <BooleanButton v-model="data.auto.leave" :default-value="'Mobility'" :other-value="'Mobility'"></BooleanButton>
        </div>
        <div v-if="gameTime == GameTime.Teleoperated">
          <IncrementalButton v-model="data.teleop.amp"></IncrementalButton>
          <IncrementalButton v-model="data.teleop.speakerNA"></IncrementalButton>
          <IncrementalButton v-model="data.teleop.speakerA"></IncrementalButton>
        </div>
        <div v-if="gameTime == GameTime.Endgame">
          <IncrementalButton v-model="data.teleop.amp"></IncrementalButton>
          <IncrementalButton v-model="data.teleop.speakerNA"></IncrementalButton>
          <IncrementalButton v-model="data.teleop.speakerA"></IncrementalButton>
          <br>
          <IncrementalButton v-model="data.endgame.trap" :max-value="3"></IncrementalButton>
          <MultiSelect :model-value="endgameIndex" :options="endgameOptions" @update:model-value="value => {updateEndgameOptions(value)}" :connected-options="[1, 2, 2, 3, 3]"></MultiSelect>
        </div>
      <template #footer>
        <UTextarea v-model="data.notes" color="yellow"/>
        <br/>
        <div class="flex justify-between">
          <div>
            <UButton class="m-1" color="rose" label="Cancel" to="/dashboard" type="reset" variant="outline"/>
            <UButton class="m-1" color="green" label="Submit" type="submit" variant="solid" :disabled="!isValidNum()" @click="submit"/>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<style scoped>

</style>