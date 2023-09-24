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

    <template #footer>
      U
      <UButton label="Cancel" to="/dashboard" type="reset"/>
    </template>
  </UCard>
</template>

<style scoped>

</style>