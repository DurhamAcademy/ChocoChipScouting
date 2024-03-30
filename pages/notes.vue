<script setup lang="ts">
import databases from "~/utils/databases"
import IncrementalButton from '~/components/IncrementalButton.vue'
import {eventOptions} from "~/utils/eventOptions";

const { scoutingData } = databases.locals
let db = scoutingData

let selectedEvent = eventOptions[0]
if (typeof window !== 'undefined') selectedEvent = localStorage.getItem('currentEvent') || eventOptions[0]

let data: Ref<UnwrapRef<{
  auto: { speakerNA: number; amp: number; missed: number; mobility: boolean };
  notes: { efficiency: number; notes: string; reliability: number };
  endgame: { endgame: string[]; trap: number };
  teamNumber: null;
  event: string;
  matchNumber: null;
  teleop: { speakerNA: number; amp: number; missed: number; }
}>> = ref({
  event: "",
  teamNumber: null,
  matchNumber: -1,
  auto: {
    speakerNA: 0,
    amp: 0,
    missed: 0,
    mobility: false,
  },
  teleop: {
    amp: 0,
    speakerNA: 0,
    missed: 0,
  },
  endgame: {
    trap: 0,
    endgame: ""
  },
  notes: {
    playedDefense: false,
    defense: 3,
    notes: "",
  }
})

async function submit() {
  data.value.event = selectedEvent
  if(data.value.teamNumber != null) {
    let doc = db.post(data.value)
    await navigateTo("dashboard")
  }
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
        <UTextarea rows="10" v-model="data.notes.notes" placeholder="Notes..."/>
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