<script lang="ts" setup>
import databases from "~/utils/databases"
import IncrementalButton from '~/components/IncrementalButton.vue'
import {eventOptions} from "~/utils/eventOptions";

const {scoutingData} = databases.locals
let db = scoutingData

//An enum of tabs on the scout page
enum GameTime {
  Autonomous = "Auto",
  Teleoperated = "Teleop",
  Endgame = "Endgame",
  Notes = "Notes"
}

//The active tab used
let gameTime = ref(GameTime.Autonomous)

let selectedEvent = localStorage.getItem('currentEvent') || eventOptions[0]


// Selectable options for the Multi-Select component
const endgameOptions = ["None", "Parked", "Attempted Onstage", "Onstage", "Harmony"]
const connectedOptions = [1, 2, 2, 3, 3]
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

/*const ph: any = dataPull(info.teamNum)();
let parsed = JSON.parse(await ph);
let impData = {
  nickname: parsed.nickname,
  */


let data: Ref<UnwrapRef<{
  auto: { speakerNA: number; amp: number; mobility: boolean };
  notes: { efficiency: number; notes: string; reliability: number };
  endgame: { endgame: string[]; trap: number };
  teamNumber: null;
  event: string;
  matchNumber: null;
  teleop: { speakerA: number; speakerNA: number; amp: number }
}>> = ref({
  event: "",
  teamNumber: null,
  matchNumber: null,
  auto: {
    speakerNA: 0,
    amp: 0,
    mobility: false,
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
  notes: {
    playedDefense: false,
    defense: 3,
    notes: "",
  }
})



function updateEndgameOptions(value: Array<number>) {
  let arr = []
  for (let i = 0; i < value.length; i++) {
    if (value[i] == 1) {
      arr.push(endgameOptions[i])
    }
  }
  data.value.endgame.endgame = arr
  if (data.value.endgame.endgame.length < 1) {
    data.value.endgame.endgame = [endgameOptions[0]]
  }
}


function isValidNum() {
  return (data.value.teamNumber != null) && (data.value.matchNumber != null) && (data.value.teamNumber > 0) && (data.value.matchNumber > 0) && (data.value.teamNumber < 10000)
}

async function submit() {
  data.value.event = selectedEvent || ""
  //SHOULD THIS BE AN AWAIT TODO
  let newDoc = db.post(data.value)
  await navigateTo("/matches")
}

/* Good-looking square buttons but don't work horizontally why?
<UButton label="Docked & Engaged" style="aspect-ratio : 1 / 1; max-width: 75px; max-height: 75px;" class="m-1.5"/>
        <UButton label="Docked" style="aspect-ratio : 1 / 1; max-width: 75px; max-height: 75px;" class="m-1.5"/>
 */
</script>

<template>
  <Navbar scout-mode></Navbar>
  <div class="flex flex-wrap justify-center">
    <UCard class="max-w-xl flex-grow m-5 ">
      <template #header>
        <div style="display:flex">
          <div style="flex:1">
            <UInput v-model="data.teamNumber" placeholder="Team #"></UInput>
          </div>
          <div style="flex:1;padding-left:5px">
            <UInput v-model="data.matchNumber" placeholder="Match #"></UInput>
          </div>
        </div>
        <br>
        <UButtonGroup class="flex">
          <UButton v-for="gamePeriod of GameTime" :variant="gameTime == gamePeriod ? 'solid': 'soft'" :label=gamePeriod block class="w-auto" enabled style="flex: 1"
                   @click="gameTime=gamePeriod"/>
        </UButtonGroup>
      </template>
      <div v-if="gameTime == GameTime.Autonomous">
        <div class="flex" style="text-align:center">
          <div>
            <h1 class="font-sans text-gray-700 dark:text-gray-200 font-medium">Amp</h1>
            <IncrementalButton v-model="data.auto.amp" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">Speaker</h1>
            <IncrementalButton v-model="data.auto.speakerNA" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <br>
            <BooleanButton v-model="data.auto.mobility" :default-value="'Mobility'" :other-value="'Mobility'"
                           style="margin:5px"></BooleanButton>
          </div>
        </div>
      </div>
      <div v-if="gameTime == GameTime.Teleoperated">
        <div class="flex" style="text-align:center">
          <div>
            <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">Amp</h1>
            <IncrementalButton v-model="data.teleop.amp" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">Speaker</h1>
            <IncrementalButton v-model="data.teleop.speakerNA" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">Speaker+</h1>
            <IncrementalButton v-model="data.teleop.speakerA" style="margin:5px"></IncrementalButton>
          </div>
        </div>
      </div>
      <div v-if="gameTime == GameTime.Endgame">
        <div class="flex" style="text-align:center">
          <div>
            <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">Amp</h1>
            <IncrementalButton v-model="data.teleop.amp" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">Speaker</h1>
            <IncrementalButton v-model="data.teleop.speakerNA" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">Speaker+</h1>
            <IncrementalButton v-model="data.teleop.speakerA" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">Trap</h1>
            <IncrementalButton v-model="data.endgame.trap" :max-value="3" style="margin:5px"></IncrementalButton>
          </div>
          </div>
          <br>
            <MultiSelect :model-value="endgameIndex" :options="endgameOptions"
                     @update:model-value="value => {updateEndgameOptions(value)}"
                     :connected-options="connectedOptions"></MultiSelect>
       </div>
      <div v-if="gameTime == GameTime.Notes">
        <div class="flex">
          <div class="flex-0 text-center">
            <p class="flex-auto text-gray-700 dark:text-gray-200 font-sans font-medium">Defended</p>
            <UCheckbox class="flex-auto mt-0.5 justify-center" v-model="data.notes.playedDefense"/>
          </div>
          <div class="flex-1 text-center">
            <p class="text-gray-700 dark:text-gray-200 font-sans font-medium mr-5">Rating</p>
            <div class="flex">
              <URange v-if="!(data.notes.playedDefense)" class="ml-3 mr-3 mt-1 flex-auto" disabled v-model="data.notes.defense" size="md" min="1" :max="5"/>
              <URange v-if="data.notes.playedDefense" class="ml-3 mr-3 mt-1 flex-auto" v-model="data.notes.defense" size="md" min="1" :max="5"/>
              <UBadge class="flex-auto" :label="data.notes.playedDefense ? data.notes.defense: 0" :variant="data.notes.playedDefense ? 'solid':'soft'"/>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <UTextarea v-model="data.notes.notes" color="yellow" placeholder="Notes..."/>
        <br/>
        <div class="flex justify-between">
          <div>
            <UButton class="m-1" color="coral" label="Cancel" to="/dashboard" type="reset" variant="outline"/>
            <UButton class="m-1" label="Submit" type="submit" variant="solid" :disabled="!isValidNum()"
                     @click="submit"/>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<style scoped>

</style>