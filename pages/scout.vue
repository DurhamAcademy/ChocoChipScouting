<script lang="ts" setup>
import databases, { ScoutingDataTest } from '~/utils/databases';
import Navbar from '~/components/website-utils/Navbar.vue';
import { eventOptions } from '~/utils/eventOptions';
import type { Ref } from '@vue/reactivity';
import type { UnwrapRef } from 'vue';
import { loginStateKey } from '~/utils/keys';
import { useEventKey } from '~/composables/useEventKey';
import jsonData from "~/components/teams-utils/scouting-data-templates/2025.json";
import TieredObjective from "~/components/scouting-components/TieredObjective.vue";
import SpecialObjective from "~/components/scouting-components/SpecialObjective.vue";
import SimpleObjective from "~/components/scouting-components/SimpleObjective.vue";
import Note from "~/components/scouting-components/Note.vue";
import NoteSections from "~/components/scouting-components/NoteSections.vue";
import Objective from "~/components/scouting-components/Objective.vue";


let scoutData = ref<ScoutingDataTest>({
  team_number: '',
  event_key: '',
  match_number: '',
  author: '',
  auto: {
    tiered_objectives: [],
    simple_objectives: [],
    special_objectives: [],
    objectives: [],
    notes: [],
  },
  teleop: {
    tiered_objectives: [],
    simple_objectives: [],
    special_objectives: [],
    objectives: [],
    notes: []
  },
  endgame: {
    tiered_objectives: [],
    simple_objectives: [],
    special_objectives: [],
    objectives: [],
    notes: []
  },
  notes: {
    note_sections: [],
    notes: []
  },
});

//gets username and scouting database
const {
  usernameState,
}: {
  usernameState: Ref<UnwrapRef<string>>;
} = inject(loginStateKey)!;
const { scoutingData: db } = databases.locals;


const gameTimes = [
  {
    label: 'Auto',
    slot: 'auto'
  },
  {
    label: 'Teleop',
    slot: 'teleop'
  },
  {
    label: 'Endgame',
    slot: 'endgame'
  },
  {
    label: 'Notes',
    slot: 'notes'
  }
]

//gets current event key
const currentEvent = useEventKey();
watch(currentEvent, value => {
  window.localStorage.setItem('currentEvent', value!);
});

//gets the blue alliance data for what teams are at the current event and puts them in an array
const { data: tbaEventData, pending: tbaPending } = await useLazyFetch<
    Array<any>
>('/api/eventTeams/' + currentEvent.value);
watch(tbaPending, () => {
  if (!tbaPending.value && tbaEventData.value != null) {
    validTeamNums.value = tbaEventData.value.map(value => value.team_number);
  }
});
let validTeamNums = ref<Array<number>>();

//a quick function to check if the team and match numbers a user enters are valid
function isTeamNumberValid() {
  return (
      !Number.isNaN(parseInt(scoutData.value.team_number)) &&
      scoutData.value.team_number != '' &&
      parseInt(scoutData.value.team_number) > 0
  );
}

function isMatchNumberValid() {
  return (
      !Number.isNaN(parseInt(scoutData.value.match_number)) &&
      scoutData.value.match_number != '' &&
      parseInt(scoutData.value.match_number) > 0
  );
}

/***
 The function that submits the data a user inputs to the couchdb database (notice db.post)
 also redirects the webpage to the /matches page (notice navigateTo)
 */
async function submit() {
  scoutData.value.author = usernameState.value;
  scoutData.value.event_key = currentEvent.value || eventOptions[0]!;
  await db.post(scoutData.value);
  await navigateTo('/teams');
}
</script>

<template>
  <Navbar scout-mode></Navbar>
  <UCard class="h-screen w-screen overflow-y-auto rounded-none">
    <div class="flex justify-center">
      <UCard class="max-w-xl flex-grow m-5 dark:bg-gray-800">
        <template #header>
          <div class="flex">
            <div class="flex-0 pr-2">
              <!-- The input for team_number shown in the heading of the page. visit NUXT UI documentaiton to understand UInput and other NUXT elements -->
              <UInput
                  v-model="scoutData.team_number"
                  placeholder="Team #"
              >
                <!-- shows the red 'not found' text if the team number inputted isnt in the valid teams array -->
                <template #trailing>
                  <span
                      class="text-red-400 dark:text-red-600 text-xs"
                      v-if="!isMatchNumberValid()"
                  >!!</span>
                  <span v-else></span>
                </template>
              </UInput>
            </div>
            <div class="flex-0 pr-2">
              <!-- the input for the match number -->
              <UInput
                  v-model="scoutData.match_number"
                  placeholder="Match #"
              >
                <!-- same thing as above, shows an error text if the number is invalid -->
                <template #trailing>
                  <span
                      class="text-red-400 dark:text-red-600 text-xs"
                      v-if="!isMatchNumberValid()
                    "
                  >error</span
                  >
                  <span v-else></span>
                </template>
              </UInput>
            </div>
            <UFormGroup class="flex-1">
              <!-- select menu between different events -->
              <USelectMenu
                  v-model="currentEvent"
                  :options="eventOptions"
              />
            </UFormGroup>
          </div>
          <UTabs :items="gameTimes" class="pt-2" variant="link" color="error">
            <template #auto="{ item }">
              <div class="flex flex-wrap w-full items-center">
                <TieredObjective
                    v-for="(tieredObjective, index) of jsonData.auto.tiered_objectives"
                    :template="tieredObjective"
                    v-model="scoutData.auto.tiered_objectives[index]!"
                    class="flex-1"
                />
                <SimpleObjective
                    v-for="(simpleObjective, index) of jsonData.auto.simple_objectives"
                    :template="simpleObjective"
                    v-model="scoutData.auto.simple_objectives[index]!"
                    class="flex-1"
                />
                <SpecialObjective
                    v-for="(specialObjective, index) of jsonData.auto.special_objectives"
                    :template="specialObjective"
                    v-model="scoutData.auto.special_objectives[index]!"
                    class="flex-1"
                />
                <Objective
                    v-for="(objective, index) of jsonData.auto.objectives"
                    :template="objective"
                    v-model="scoutData.auto.objectives[index]!"
                    class="flex-1"
                />
              </div>
              <Note
                  v-for="(note, index) of jsonData.auto.notes"
                  :template="note"
                  v-model="scoutData.auto.notes[index]!"
              />
            </template>
            <template #teleop="{ item }">
              <div class="flex flex-wrap w-full items-center">
                <TieredObjective
                    v-for="(tieredObjective, index) of jsonData.teleop.tiered_objectives"
                    :template="tieredObjective"
                    v-model="scoutData.teleop.tiered_objectives[index]!"
                    class="flex-1"
                />
                <SimpleObjective
                    v-for="(simpleObjective, index) of jsonData.teleop.simple_objectives"
                    :template="simpleObjective"
                    v-model="scoutData.teleop.simple_objectives[index]!"
                    class="flex-1"
                />
                <SpecialObjective
                    v-for="(specialObjective, index) of jsonData.teleop.special_objectives"
                    :template="specialObjective"
                    v-model="scoutData.teleop.special_objectives[index]!"
                    class="flex-1"
                />
                <Objective
                    v-for="(objective, index) of jsonData.teleop.objectives"
                    :template="objective"
                    v-model="scoutData.teleop.objectives[index]!"
                    class="flex-1"
                />
              </div>
              <Note v-for="(note, index) of jsonData.teleop.notes"
                    :template="note"
                    v-model="scoutData.teleop.notes[index]!" />
            </template>
            <template #endgame="{ item }">
              <div class="flex flex-wrap w-full items-center">
                <TieredObjective
                    v-for="(tieredObjective, index) of jsonData.endgame.tiered_objectives"
                    :template="tieredObjective"
                    v-model="scoutData.endgame.tiered_objectives[index]!"
                    class="flex-1"
                />
                <SimpleObjective
                    v-for="(simpleObjective, index) of jsonData.endgame.simple_objectives"
                    :template="simpleObjective"
                    v-model="scoutData.endgame.simple_objectives[index]!"
                    class="flex-1"
                />
                <SpecialObjective
                    v-for="(specialObjective, index) of jsonData.endgame.special_objectives"
                    :template="specialObjective"
                    v-model="scoutData.endgame.special_objectives[index]!"
                    class="flex-1"
                />
                <Objective
                    v-for="(objective, index) of jsonData.endgame.objectives"
                    :template="objective"
                    v-model="scoutData.endgame.objectives[index]!"
                    class="flex-1"
                />
              </div>
              <Note
                  v-for="(note, index) of jsonData.endgame.notes"
                  :template="note"
                  v-model="scoutData.endgame.notes[index]!"
              />
            </template>
            <template #notes="{ item }">
              <NoteSections
                  :template="jsonData.notes.note_sections"
                  v-model="scoutData.notes.note_sections"
              />
              <Note
                  v-for="(note, index) of jsonData.notes.notes"
                  :template="note" v-model="scoutData.notes.notes[index]!"
              />
            </template>
          </UTabs>
        </template>
        <template #footer>
          <div class="flex justify-between">
            <div>
              <!-- a button to cancel -->
              <UButton
                  class="m-1"
                  color="coral"
                  label="Cancel"
                  to="/dashboard"
                  type="reset"
                  variant="outline"
              />
              <!-- a button to submit -->
              <UButton
                  class="m-1"
                  label="Submit"
                  type="submit"
                  variant="solid"
                  :disabled="!isTeamNumberValid() || !isMatchNumberValid()"
                  @click="submit"
              />
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </UCard>
</template>

<style scoped></style>
