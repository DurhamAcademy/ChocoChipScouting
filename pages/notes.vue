<script setup lang="ts">
import databases from "~/utils/databases"
import IncrementalButton from '~/components/IncrementalButton.vue'

const { scoutingData } = databases.locals
let db = scoutingData


let data = ref({
  teamNumber: null,
  matchNumber: -1,
  event: "",
  notes: "",
})

console.log(db)

async function submit() {
  data.value.event = window.localStorage.getItem("event") || ""
  let newDoc = db.post(data.value)
  await navigateTo("dashboard")
}

</script>

<template>
  <Navbar notes-mode></Navbar>
  <div class="flex justify-center">
    <UCard class="max-w-xl flex-grow m-5 ">
      <template #default>
        <div class="pb-1.5">
          <UInput v-model="data.teamNumber" placeholder="Team #"></UInput>
        </div>
        <UTextarea rows="10" v-model="data.notes" placeholder="Notes..."/>
      </template>
      <template #footer>
        <div class="flex justify-between">
          <UButton class="m-1" color="rose" label="Cancel" to="/dashboard" type="reset" variant="outline"/>
          <UButton class="m-1" color="green" label="Submit" type="submit" variant="solid" @click="submit"/>
        </div>
      </template>
    </UCard>
  </div>
</template>

<style scoped>

</style>