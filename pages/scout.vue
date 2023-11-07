<script lang="ts" setup>
import databases from "~/utils/databases"
import {integer} from "vscode-languageserver-types";
import IncrementalButton from '~/components/IncrementalButton.vue'
const { scoutingData } = databases.locals
enum GameTime {
  Autonomous = "Auto",
  Teleoperated = "Teleop",
  Endgame = "Endgame"
}


let gameTime = ref(GameTime.Autonomous)

let cone = ref([0, 0, 0])
let cube = ref([0, 0, 0])

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

function addToCone(height: String, direction: integer){
  switch (height) {
    case "low":
      cone.value[0] = cone.value[0] + (direction > 0 ? 1: -1)
      break;
    case "mid":
      cone.value[1] = cone.value[1] + (direction > 0 ? 1: -1)
      break;
    case "high":
      cone.value[2] = cone.value[2] + (direction > 0 ? 1: -1)
      break;
  }
}

function addToCube(height: String, direction: integer){
  switch (height) {
    case "low":
      cube.value[0] = cube.value[0] + (direction > 0 ? 1: -1)
      break;
    case "mid":
      cube.value[1] = cube.value[1] + (direction > 0 ? 1: -1)
      break;
    case "high":
      cube.value[2] = cube.value[2] + (direction > 0 ? 1: -1)
      break;
  }
}

const notesOpen = ref(false)

let data = ref({
  points: 0,
  top: 0,
  middle: 0,
  low: 0,
  notes: "",
})

let db = scoutingData

async function submit() {
  var newDoc = await db.post(data.value)
  await navigateTo("matches")
}
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
      <div v-if="gameTime == GameTime.Autonomous">
        
      </div>
      <div v-if="gameTime == GameTime.Teleoperated">
        <div class="w-1/2" id="cone-div" style="text-align:center; display:inline-block">
          <h1 class="mb-2.5">Cone</h1>
        <IncrementalButton v-model="cone[2]"/>
          <br/>
        <IncrementalButton v-model="cone[1]"/>
          <br/>
        <IncrementalButton v-model="cone[0]"/>

        </div>
      </div>
      <div v-if="gameTime == GameTime.Endgame">

      </div>
      <template #footer>
        <div class="flex justify-between">
          <div>
            <UButton class="m-1" color="rose" label="Cancel" to="/dashboard" type="reset" variant="outline"/>
            <UButton class="m-1" color="green" label="Submit" type="submit" variant="solid" @click="submit"/>
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