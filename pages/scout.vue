<script lang="ts" setup>
import databases from "~/utils/databases"
import {integer} from "vscode-languageserver-types";
import IncrementalButton from '~/components/IncrementalButton.vue'
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

let data = ref({
  points: 0,
  ConeHigh: 0,
  ConeMid: 0,
  ConeLow: 0,
  CubeHigh: 0,
  CubeMid: 0,
  CubeLow: 0,
  endgame: endgames[selectedIndex],
  notes: "",
})


async function submit() {
  var newDoc = await db.post(data.value)
  await navigateTo("matches")
}

/* Good looking square buttons but dont work horizontally why?
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
        <SingleSelect v-model="selectedIndex" :options="endgames"></SingleSelect>
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