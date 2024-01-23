<script lang="ts" setup>
import databases from "~/utils/databases"
import IncrementalButton from '~/components/IncrementalButton.vue'

const {scoutingData} = databases.locals
let db = scoutingData


enum GameTime {
  Autonomous = "Auto",
  Teleoperated = "Teleop",
  Endgame = "Endgame"
}

let gameTime = ref(GameTime.Autonomous)


const endgameOptions = ["None", "Parked", "Attempted Onstage", "Onstage", "Harmony"]
let endgameIndex = [1, 0, 0, 0, 0]

let counter: { min: number, sec: number }
let matchStarted = ref(false)

function startTimer() {
  matchStarted.value = true
  counter = {min: 0, sec: 0} // choose whatever you want
  let intervalId = setInterval(() => {
    console.log(counter)
    if (counter.sec + 1 == 60) {
      counter.min += 1;
      counter.sec = 0;
    } else counter.sec += 1
    if (counter.min === 2 && counter.sec == 45) clearInterval(intervalId)
  }, 1000)
}


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

let timedArrPlaceholder: Array<Array<any>> = []
let prevData: ((number | boolean)[] | (number | string[])[])[] | undefined = [[0, 0, false], [0, 0, 0], [0, [""]]]

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
  timedArr: timedArrPlaceholder
})

watch(data, (value) => {
  let valueArr = [Object.values(value.auto), Object.values(value.teleop), Object.values(value.endgame)]
  let keyArr = [Object.keys(value.auto), Object.keys(value.teleop), Object.keys(value.endgame)]
  if (prevData != undefined) {
    loop: for (let i = 0; i < valueArr.length; i++) {
      for (let j = 0; j < valueArr[i].length; j++) {
        if (valueArr[i][j] != prevData[i][j]) {
          if (typeof valueArr[i][j] === "number" && valueArr[i][j] < prevData[i][j])
            for (let x = data.value.timedArr.length - 1; x >= 0; x--) {
              if (Object.values(data.value.timedArr[x])[0].split(" ")[0] == keyArr[i][j].toString()) {
                data.value.timedArr.splice(x, 1)
                break;
              }
            }
          else
            data.value.timedArr.push([keyArr[i][j].toString() + " " + valueArr[i][j].toString(), counter != undefined ? counter.min * 60 + counter.sec : counter])
          break loop
        }
      }
    }
  }
  prevData = valueArr
}, {deep: true})


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
          <div style="flex:.5">
            <UButton :disabled="matchStarted" :label="'Start Match'" @click="startTimer"
                     style="margin-left:5px"></UButton>
          </div>
        </div>
        <br>
        <UButtonGroup class="flex">
          <UButton :label=GameTime.Autonomous block class="w-auto" enabled style="flex: 1"
                   @click="gameTime= GameTime.Autonomous"/>
          <UButton :label=GameTime.Teleoperated block class="w-auto" enabled style="flex: 1;"
                   @click="gameTime= GameTime.Teleoperated"/>
          <UButton :label=GameTime.Endgame block class="w-auto" enabled style="flex: 1;"
                   @click="gameTime= GameTime.Endgame"/>
        </UButtonGroup>
      </template>
      <div v-if="gameTime == GameTime.Autonomous">
        <div class="flex" style="text-align:center">
          <div>
            <h1 class="text-green-600 font-sans">Amp</h1>
            <IncrementalButton v-model="data.auto.amp" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <h1 class="text-green-600 font-sans">Speaker</h1>
            <IncrementalButton v-model="data.auto.speakerNA" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <br>
            <BooleanButton v-model="data.auto.leave" :default-value="'Mobility'" :other-value="'Mobility'"
                           style="margin:5px"></BooleanButton>
          </div>
        </div>
      </div>
      <div v-if="gameTime == GameTime.Teleoperated">
        <div class="flex" style="text-align:center">
          <div>
            <h1 class="text-green-600 font-sans">Amp</h1>
            <IncrementalButton v-model="data.teleop.amp" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <h1 class="text-green-600 font-sans">SpeakerNA</h1>
            <IncrementalButton v-model="data.teleop.speakerNA" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <h1 class="text-green-600 font-sans">SpeakerA</h1>
            <IncrementalButton v-model="data.teleop.speakerA" style="margin:5px"></IncrementalButton>
          </div>
        </div>
      </div>
      <div v-if="gameTime == GameTime.Endgame">
        <div class="flex" style="text-align:center">
          <div>
            <h1 class="text-green-600 font-sans">Amp</h1>
            <IncrementalButton v-model="data.teleop.amp" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <h1 class="text-green-600 font-sans">SpeakerNA</h1>
            <IncrementalButton v-model="data.teleop.speakerNA" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <h1 class="text-green-600 font-sans">SpeakerA</h1>
            <IncrementalButton v-model="data.teleop.speakerA" style="margin:5px"></IncrementalButton>
          </div>
          <div>
            <h1 class="text-green-600 font-sans">Trap</h1>
            <IncrementalButton v-model="data.endgame.trap" style="margin:5px"></IncrementalButton>
          </div>
        </div>
        <br>
        <MultiSelect :model-value="endgameIndex" :options="endgameOptions"
                     @update:model-value="value => {updateEndgameOptions(value)}"
                     :connected-options="[1, 2, 2, 3, 3]"></MultiSelect>
      </div>
      <template #footer>
        <UTextarea v-model="data.notes" color="yellow" placeholder="Notes..."/>
        <br/>
        <div class="flex justify-between">
          <div>
            <UButton class="m-1" color="rose" label="Cancel" to="/dashboard" type="reset" variant="outline"/>
            <UButton class="m-1" color="green" label="Submit" type="submit" variant="solid" :disabled="!isValidNum()"
                     @click="submit"/>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<style scoped>

</style>