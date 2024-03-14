<script lang="ts" setup>
import databases from "~/utils/databases"
import IncrementalButton from '~/components/IncrementalButton.vue'
import {eventOptions} from "~/utils/eventOptions";
import PouchDB from "pouchdb";
import type {Ref} from "@vue/reactivity";
import type {UnwrapRef} from "vue";
import {loginStateKey} from "~/utils/keys";

const {usernameState}: {
  usernameState: Ref<UnwrapRef<string>>;
} = inject(loginStateKey)!

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

const events = eventOptions
let selectedEvent = ref(eventOptions[0])
if (typeof window !== 'undefined') selectedEvent.value = localStorage.getItem('currentEvent') || eventOptions[0]
watch(selectedEvent, (value) => {
  window.localStorage.setItem('currentEvent', value)
})

const {data, pending} = await useLazyFetch<Array<any>>("/api/eventTeams/" + selectedEvent.value)

watch(pending, () => {
  if(!pending.value && data.value != null){
    validTeamNums.value = data.value.map((value) => value.team_number)
  }
})

let validTeamNums = ref<Array<number>>()

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


//todo fix
let scoutData: Ref<UnwrapRef<{
  auto: { speakerNA: number; amp: number; mobility: boolean };
  notes: {  notes: string; promptedNotes: Array<Array<boolean | number | Array<string>>> };
  endgame: { endgame: string[]; trap: number; spotlight: number };
  teamNumber: any;
  event: string;
  matchNumber: any;
  author: string;
  teleop: { speakerNA: number; amp: number }
}>> = ref({
  event: "",
  teamNumber: "",
  matchNumber: "",
  author: "",
  auto: {
    speakerNA: 0,
    amp: 0,
    mobility: false,
  },
  teleop: {
    amp: 0,
    speakerNA: 0,
  },
  endgame: {
    trap: 0,
    endgame: [endgameOptions[0]],
    spotlight: 0
  },
  notes: {
    notes: "",
    promptedNotes: [[false, 1, []], [false, 1, []], [false, 1, []]]
  }
})



function updateEndgameOptions(value: Array<number>) {
  let arr = []
  for (let i = 0; i < value.length; i++) {
    if (value[i] == 1) {
      arr.push(endgameOptions[i])
    }
  }
  scoutData.value.endgame.endgame = arr
  if (scoutData.value.endgame.endgame.length < 1) {
    scoutData.value.endgame.endgame = [endgameOptions[0]]
  }
}


function isValidNum() {
  return (scoutData.value.teamNumber != null) && (scoutData.value.matchNumber != null) && (scoutData.value.teamNumber > 0) && (scoutData.value.matchNumber > 0) && (scoutData.value.teamNumber < 10000)
}

async function submit() {
  scoutData.value.teamNumber = parseInt(scoutData.value.teamNumber)
  scoutData.value.matchNumber = parseInt(scoutData.value.matchNumber)
  if(!Number.isNaN(scoutData.value.teamNumber) && !Number.isNaN(scoutData.value.teamNumber)) {
    scoutData.value.author = usernameState.value
    scoutData.value.event = selectedEvent.value || eventOptions[0]
    let newDoc = await db.post(scoutData.value)
    await navigateTo("/matches")
  }
}

/* Good-looking square buttons but don't work horizontally why?
<UButton label="Docked & Engaged" style="aspect-ratio : 1 / 1; max-width: 75px; max-height: 75px;" class="m-1.5"/>
        <UButton label="Docked" style="aspect-ratio : 1 / 1; max-width: 75px; max-height: 75px;" class="m-1.5"/>
 */
</script>

<template>
  <Navbar scout-mode></Navbar>
  <div class="flex justify-center">
    <UCard class="max-w-xl flex-grow m-5">
      <template #header>
        <div style="display:flex">
          <div class="flex-0 pr-2">
            <UInput v-model="scoutData.teamNumber" placeholder="Team #" >
              <template #trailing>
                <span class="text-red-400 dark:text-red-600 text-xs" v-if="validTeamNums && validTeamNums.length > 0 && !validTeamNums.includes(parseInt(scoutData.teamNumber))">not found</span>
              </template>
            </UInput>
          </div>
          <div class="flex-0 pr-2">
            <UInput v-model="scoutData.matchNumber" placeholder="Match #">
              <template #trailing>
                <span class="text-red-400 dark:text-red-600 text-xs" v-if="isNaN(parseInt(scoutData.matchNumber)) && scoutData.matchNumber != null && scoutData.matchNumber != ''">error</span>
              </template>
            </UInput>
          </div>
          <UFormGroup class="flex-1">
            <USelectMenu v-model="selectedEvent" :options="events"/>
          </UFormGroup>
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
            <IncrementalButton v-model="scoutData.auto.amp" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">Speaker</h1>
            <IncrementalButton v-model="scoutData.auto.speakerNA" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <br>
            <BooleanButton v-model="scoutData.auto.mobility" :default-value="'Mobility'" :other-value="'Mobility'"
                           style="margin:5px"></BooleanButton>
          </div>
        </div>
      </div>
      <div v-if="gameTime == GameTime.Teleoperated">
        <div class="flex" style="text-align:center">
          <div>
            <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">Amp</h1>
            <IncrementalButton v-model="scoutData.teleop.amp" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">Speaker</h1>
            <IncrementalButton v-model="scoutData.teleop.speakerNA" style="margin:5px"></IncrementalButton>
          </div>
        </div>
      </div>
      <div v-if="gameTime == GameTime.Endgame">
        <div class="flex text-center flex-wrap">
          <div>
            <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">Trap</h1>
            <IncrementalButton v-model="scoutData.endgame.trap" :max-value="3" style="margin:5px"></IncrementalButton>
          </div>
          <div class="ml-3">
            <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">Spotlights Hit</h1>
            <SingleSelect  v-model="scoutData.endgame.spotlight" :options="['0', '1', '2', '3']"/>
          </div>
        </div>
          <br>
            <MultiSelect :model-value="endgameIndex" :options="endgameOptions"
                     @update:model-value="value => {updateEndgameOptions(value)}"
                     :connected-options="connectedOptions"/>
       </div>
      <div v-if="gameTime == GameTime.Notes">
        <UAccordion
            open-icon="i-heroicons-plus"
            close-icon="i-heroicons-minus"
            :items="[{ label: 'Defense', slot: 'defense', defaultOpen: true}, { label: 'Offense', slot: 'offense'}, { label: 'Driver', slot: 'driver'}]"
        >
          <template #defense>
            <PromptedNote v-model="scoutData.notes.promptedNotes[0]" :questions="[['Where did this team play defense?', 1], ['Is this team at risk of causing fouls? Elaborate why.', 2], ['What other factors contributed to your rating?', 1]]"/>
          </template>
          <template #offense>
            <PromptedNote v-model="scoutData.notes.promptedNotes[1]" :questions="[['Where can this team shoot from?', 1], ['If applicable, how did the driver make efforts to avoid defense?', 2], ['What other factors contributed to your rating?', 1]]"/>
          </template>
          <template #driver>
            <PromptedNote v-model="scoutData.notes.promptedNotes[2]" :questions="[['What makes their driving strong?', 1], ['What makes their driving weak?', 1], ['What other factors contributed to your rating?', 1]]"/>
          </template>
        </UAccordion>
      </div>
      <template #footer>
        <UTextarea v-model="scoutData.notes.notes" color="yellow" placeholder="Notes..."/>
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