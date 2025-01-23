<script setup lang="ts">
import databases, { ScoutingData } from '~/utils/databases';
import { eventOptions } from '~/utils/eventOptions';
import Navbar from '~/components/website-utils/Navbar.vue';

const { scoutingData } = databases.locals;
let db = scoutingData;

let selectedEvent = eventOptions[0];
if (typeof window !== 'undefined')
  selectedEvent = localStorage.getItem('currentEvent') || eventOptions[0];

let data = ref<ScoutingData>({
  event: '',
  teamNumber: '',
  matchNumber: -1,
  author: '',
  auto: {
    coralL1: 0,
    coralL2: 0,
    coralL3: 0,
    coralL4: 0,
    processorMiss: 0,
    processor: 0,
    netMiss: 0,
    net: 0,
    mobility: false,
  },
  teleop: {
    coralL1: 0,
    coralL2: 0,
    coralL3: 0,
    coralL4: 0,
    processorMiss: 0,
    processor: 0,
    netMiss: 0,
    net: 0,
  },
  endgame: {
    endgame: [""],
  },
  notes: {
    notes: '',
    promptedNotes: [
      {
        selected: false,
        rating: 1,
        notes: [],
      },
      {
        selected: false,
        rating: 1,
        notes: [],
      },
      {
        selected: false,
        rating: 1,
        notes: [],
      },
    ],
  },
});

function checkInvalidTeamNum(teamNum: number) {
return !(teamNum != null && teamNum > 0 && teamNum < 10000);
}

/**
 * Submits the data to the server though db.post
 */
async function submit() {
  data.value.event = selectedEvent;
  if (!checkInvalidTeamNum(data.value.teamNumber)) {
    let doc = db.post(data.value);
    await navigateTo('/dashboard');
  }
}
</script>

<template>
  <Navbar notes-mode></Navbar>
  <UCard class="h-screen w-screen rounded-none">
    <div class="flex justify-center">
    <UCard class="max-w-xl flex-grow m-5 border-4 dark:border-gray-800">
      <template #header>
        <strong class="text-2xl">Add Notes</strong>
      </template>
      <template #default>
        <div class="pb-1.5">
          <UInput
            v-model="data.teamNumber"
            placeholder="Team #"
          >
            <template #trailing>
                <span
                  class="text-red-400 dark:text-red-600 text-xs"
                  v-if="
                    checkInvalidTeamNum(data.teamNumber)
                  "
                >!!
                </span
                >
              <span v-else></span>
            </template>
          </UInput>
        </div>
        <UDivider label="🍪" class="mt-2 mb-2"/>
        <UTextarea
          v-model="data.notes.notes"
          placeholder="Other notes..."
          :rows="10"
        />
      </template>
      <template #footer>
        <div class="flex justify-between">
          <UButton
            class="m-1"
            color="rose"
            label="Cancel"
            to="/dashboard"
            type="reset"
            variant="outline"
          />
          <UButton
            class="m-1"
            label="Submit"
            type="submit"
            variant="solid"
            @click="submit"
          />
        </div>
      </template>
    </UCard>
  </div>
  </UCard>
</template>

<style scoped></style>
