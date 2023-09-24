<script lang="ts" setup>

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

let points = ref(0)

let upDB = new PouchDB(couchDBBaseURL + "/scouting-data")
let db = new PouchDB("scoutingData");
upDB.sync(db, {live: true, retry: true})

async function submit() {
  var newDoc = await db.post({
    points: points.value
  })
  console.log(newDoc)
}
</script>

<template>
  <Navbar scout-mode></Navbar>
  <UCard>
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
      <UButtonGroup class="flex">
        <UButton :disabled="points <= 0" icon="i-heroicons-chevron-left"
                 @click="points--"/>
        <UButton :label="points.toLocaleString()" block class="w-auto" disabled style="flex-grow: 1;"/>
        <UButton icon="i-heroicons-chevron-right" @click="points++"/>
      </UButtonGroup>
    </div>
    <div v-if="gameTime == GameTime.Endgame">

    </div>
    <template #footer>
      <UButton class="m-1" color="rose" label="Cancel" to="/dashboard" type="reset" variant="outline"/>
      <UButton class="m-1" color="green" label="Submit" type="submit" variant="solid" @click="submit"/>
    </template>
  </UCard>
</template>

<style scoped>

</style>