<script lang="ts" setup>
import databases from "~/utils/databases"
const { scoutingData } = databases.locals
enum GameTime {
  Autonomous = "Auto",
  Teleoperated = "Teleop",
  Endgame = "Endgame"
}


let gameTime = ref(GameTime.Autonomous)

function incrementGameTime() {
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

function deincrementGameTime() {
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
                     @click="deincrementGameTime"/>
            <UButton :label="gameTime.valueOf()" block class="w-auto" disabled style="flex-grow: 1;"/>
            <UButton :disabled="gameTime==GameTime.Endgame" icon="i-heroicons-chevron-right" @click="incrementGameTime"/>
          </UButtonGroup>
      </template>
      <div v-if="gameTime == GameTime.Autonomous">

      </div>
      <div v-if="gameTime == GameTime.Teleoperated">
        <UFormGroup label="Points">
          <UButtonGroup class="flex">
            <UButton :disabled="data.points <= 0" icon="i-heroicons-chevron-left"
                     @click="data.points--"/>
            <UButton :label="data.points.toLocaleString()" block class="w-auto" disabled style="flex-grow: 1;"/>
            <UButton icon="i-heroicons-chevron-right" @click="data.points++"/>
          </UButtonGroup>
        </UFormGroup>
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