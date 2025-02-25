<script lang="ts" setup>
import databases, { ScoutingData } from '~/utils/databases';
import IncrementalButton from '~/components/scouting-components/IncrementalButton.vue';
import BooleanButton from '~/components/scouting-components/BooleanButton.vue';
import PromptedNote from '~/components/scouting-components/PromptedNote.vue';
import Navbar from '~/components/website-utils/Navbar.vue';
import { eventOptions } from '~/utils/eventOptions';
import type { Ref } from '@vue/reactivity';
import type { UnwrapRef } from 'vue';
import { loginStateKey } from '~/utils/keys';
import { useEventKey } from '~/composables/useEventKey';
import SingleSelect from '~/components/scouting-components/SingleSelect.vue';
import { promptedNoteOptions } from '~/utils/promptedNoteOptions';
import MultiSelect from '~/components/scouting-components/MultiSelect.vue';

/*
START SEASONAL UPDATE AREA
 */

/*
The following are a bunch of configuration variables used for the 2024 season
Each is labeled with which component in the HTML below it corresponds with
Feel free to delete these when you update this page,
just make sure you understand how they are used in case you wish to use the same custom components we used
 */
//Endgame Multi-Select Component Options
const endgameOptions = [
  'None',
  'Parked',
  'Shallow Attempted',
  'Shallow Successful',
  'Deep Attempted',
  'Deep Successful',
];
const allianceWinLoss = ['Blue Win', 'Red Win'];

const isAutoPositionOpen = ref(false);

/*
Used to configure coral buttons
 */
const coralLevel = ref(0);

/*
Configuration variables done
 */

/**
 * updateEndgameOptions updates the scoutData variable to match the currently selected option in the endgame multiselect
 * @param value the currently selected option
 */
function updateEndgameOptions(value: Array<number>) {
  let arr = [];
  for (let i = 0; i < value.length; i++) {
    if (value[i] == 1) {
      arr.push(endgameOptions[i]);
    }
  }
  scoutData.value.endgame.endgame = arr;
  if (scoutData.value.endgame.endgame.length < 1) {
    scoutData.value.endgame.endgame = [endgameOptions[0]];
  }
}

// all the data collected on the scout page in the form of a ScoutingData object,
// you can edit this in the utils/databases.ts file
let scoutData = ref<ScoutingData>({
  event: '',
  teamNumber: '',
  matchNumber: '',
  author: '',
  auto: {
    coralL1: 0,
    coralL2: 0,
    coralL3: 0,
    coralL4: 0,
    coralL1Miss: 0,
    coralL2Miss: 0,
    coralL3Miss: 0,
    coralL4Miss: 0,
    reef: 0,
    reefMiss: 0,
    processorMiss: 0,
    processor: 0,
    netMiss: 0,
    net: 0,
    mobility: false,
    position: 0,
  },
  teleop: {
    coralL1: 0,
    coralL2: 0,
    coralL3: 0,
    coralL4: 0,
    coralL1Miss: 0,
    coralL2Miss: 0,
    coralL3Miss: 0,
    coralL4Miss: 0,
    reef: 0,
    reefMiss: 0,
    processorMiss: 0,
    processor: 0,
    netMiss: 0,
    net: 0,
  },
  endgame: {
    endgame: [endgameOptions[0]],
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
      {
        selected: false,
        rating: 1,
        notes: [],
      },
    ],
  },
});

/*
END SEASON UPDATE AREA
NOTE: you must also update the HTML at the bottom of this page that defines how users will scout matches
to make your work easier we have implemented custom components in the /components directory that you can use just like other HTML objects
 */

//gets username and scouting database
const {
  usernameState,
}: {
  usernameState: Ref<UnwrapRef<string>>;
} = inject(loginStateKey)!;
const { scoutingData: db } = databases.locals;

//An enum of tabs on the scout page
enum GameTime {
  Autonomous = 'Auto',
  Teleoperated = 'Teleop',
  Endgame = 'Endgame',
  Notes = 'Notes',
}

//The active tab used
let gameTime = ref(GameTime.Autonomous);

//gets current event key
const currentEvent = useEventKey();
watch(currentEvent, value => {
  window.localStorage.setItem('currentEvent', value);
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
function isValidNum() {
  return (
    scoutData.value.teamNumber != null &&
    scoutData.value.matchNumber != null &&
    scoutData.value.teamNumber > 0 &&
    scoutData.value.matchNumber > 0 &&
    scoutData.value.teamNumber < 10000
  );
}

/***
 The function that submits the data a user inputs to the couchdb database (notice db.post)
 also redirects the webpage to the /matches page (notice navigateTo)
   */
async function submit() {
  scoutData.value.teamNumber = parseInt(scoutData.value.teamNumber);
  scoutData.value.matchNumber = parseInt(scoutData.value.matchNumber);
  if (
    !Number.isNaN(scoutData.value.teamNumber) &&
    !Number.isNaN(scoutData.value.matchNumber)
  ) {
    scoutData.value.author = usernameState.value;
    scoutData.value.event = currentEvent.value || eventOptions[0];
    await db.post(scoutData.value);
    await navigateTo('/teams');
  }
}
</script>

<template>
  <div class="overflow-y-hidden">
    <Navbar scout-mode></Navbar>
    <UCard class="h-full w-screen overflow-y-auto rounded-none">
      <div class="flex justify-center">
        <UCard class="max-w-xl flex-grow m-5 dark:bg-gray-800">
          <template #header>
            <div style="display: flex">
              <div class="flex-0 pr-2">
                <!-- The input for teamNumber shown in the heading of the page. visit NUXT UI documentaiton to understand UInput and other NUXT elements -->
                <UInput
                  v-model="scoutData.teamNumber"
                  placeholder="Team #"
                >
                  <!-- shows the red 'not found' text if the team number inputted isnt in the valid teams array -->
                  <template #trailing>
                    <span
                      class="text-red-400 dark:text-red-600 text-xs"
                      v-if="
                        validTeamNums &&
                        validTeamNums.length > 0 &&
                        !validTeamNums.includes(parseInt(scoutData.teamNumber))
                      "
                      >!!</span
                    >
                    <span v-else></span>
                  </template>
                </UInput>
              </div>
              <div class="flex-0 pr-2">
                <!-- the input for the match number -->
                <UInput
                  v-model="scoutData.matchNumber"
                  placeholder="Match #"
                >
                  <!-- same thing as above, shows an error text if the number is invalid -->
                  <template #trailing>
                    <span
                      class="text-red-400 dark:text-red-600 text-xs"
                      v-if="
                        isNaN(parseInt(scoutData.matchNumber)) &&
                        scoutData.matchNumber != null &&
                        scoutData.matchNumber != ''
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
            <br />
            <!-- the tabs for each game period (auto, teleop, endgame, notes) -->
            <UButtonGroup class="flex">
              <UButton
                v-for="gamePeriod of GameTime"
                :variant="gameTime == gamePeriod ? 'solid' : 'soft'"
                :label="gamePeriod"
                block
                class="w-auto"
                enabled
                style="flex: 1"
                @click="gameTime = gamePeriod"
              />
            </UButtonGroup>
          </template>
          <!-- In this section put all the elements you want to be shown under the autonomous tab -->
          <div
            v-if="gameTime == GameTime.Autonomous"
            class="overflow-y-scroll max-h-80 w-full min-h-36"
          >
            <div class="flex flex-wrap">
              <div class="text-center lg:w-1/2 w-full">
                <h1 class="text-gray-700 dark:text-gray-200 font-bold">
                  Coral
                </h1>
                <div class="flex flex-wrap justify-center">
                  <div class="flex">
                    <div class="text-center mr-2">
                      <h1 class="text-coral-400 font-light text-sm mt-1">
                        Missed
                      </h1>
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.auto.coralL1Miss"
                        v-if="coralLevel === 0"
                      />
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.auto.coralL2Miss"
                        v-else-if="coralLevel === 1"
                      />
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.auto.coralL3Miss"
                        v-else-if="coralLevel === 2"
                      />
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.auto.coralL4Miss"
                        v-else
                      />
                    </div>
                    <div class="text-center">
                      <h1 class="text-coral-400 font-light text-sm mt-1">
                        Scored
                      </h1>
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.auto.coralL1"
                        v-if="coralLevel === 0"
                      />
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.auto.coralL2"
                        v-else-if="coralLevel === 1"
                      />
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.auto.coralL3"
                        v-else-if="coralLevel === 2"
                      />
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.auto.coralL4"
                        v-else
                      />
                    </div>
                  </div>
                </div>
                <SingleSelect
                  v-model="coralLevel"
                  :options="['L1', 'L2', 'L3', 'L4']"
                  class="ml-0.5"
                />
              </div>

              <div class="text-center lg:w-1/2 w-full">
                <h1 class="text-gray-700 dark:text-gray-200 font-bold">Auto</h1>
                <h1 class="text-coral-400 font-light text-sm">Position</h1>
                <div class="flex justify-center">
                  <SingleSelect
                    v-model="scoutData.auto.position"
                    :options="['1', '2', '3', '4']"
                  />
                  <UButton
                    class="m-1"
                    icon="i-heroicons-photo"
                    color="primary"
                    variant="solid"
                    @click="isAutoPositionOpen = !isAutoPositionOpen"
                  />
                </div>
                <BooleanButton
                  :model-value="scoutData.auto.mobility"
                  default-value="Mobility"
                  other-value="Mobility"
                  class="mt-0.5"
                />
              </div>

              <UModal v-model="isAutoPositionOpen">
                <div class="flex relative">
                  <UButton
                    class="absolute right-0 m-2"
                    icon="i-heroicons-x-circle"
                    @click="isAutoPositionOpen = false"
                  />
                  <img
                    src="/public/ref-image(2025).png"
                    alt="A picture of the playfield of this year's game"
                    class="w-full sm:w-full md:w-3/4 lg:w-full"
                  />
                </div>
              </UModal>
            </div>
          </div>

          <!-- In this section put all the elements you want to be shown under the teleop tab -->
          <div
            v-if="gameTime == GameTime.Teleoperated"
            class="overflow-y-scroll max-h-80 min-h-36"
          >
            <div class="flex flex-wrap">
              <div class="text-center lg:w-1/2 w-full">
                <h1 class="text-gray-700 dark:text-gray-200 font-bold">
                  Coral
                </h1>
                <div class="flex justify-center">
                  <div class="flex">
                    <div class="text-center mr-2">
                      <h1 class="text-coral-400 font-light text-sm mt-1">
                        Missed
                      </h1>
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.teleop.coralL1Miss"
                        v-if="coralLevel === 0"
                      />
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.teleop.coralL2Miss"
                        v-else-if="coralLevel === 1"
                      />
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.teleop.coralL3Miss"
                        v-else-if="coralLevel === 2"
                      />
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.teleop.coralL4Miss"
                        v-else
                      />
                    </div>
                    <div class="text-center">
                      <h1 class="text-coral-400 font-light text-sm mt-1">
                        Scored
                      </h1>
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.teleop.coralL1"
                        v-if="coralLevel === 0"
                      />
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.teleop.coralL2"
                        v-else-if="coralLevel === 1"
                      />
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.teleop.coralL3"
                        v-else-if="coralLevel === 2"
                      />
                      <IncrementalButton
                        class="my-1"
                        v-model="scoutData.teleop.coralL4"
                        v-else
                      />
                    </div>
                  </div>
                </div>
                <SingleSelect
                  v-model="coralLevel"
                  :options="['L1', 'L2', 'L3', 'L4']"
                  class="ml-0.5"
                />
              </div>

              <div class="flex justify-center lg:w-1/2 w-full">
                <div class="text-center">
                  <h1 class="text-gray-700 dark:text-gray-200 font-bold">
                    Net
                  </h1>
                  <h1 class="text-coral-400 font-light text-sm">Scored</h1>
                  <IncrementalButton v-model="scoutData.teleop.net" />
                  <h1 class="text-coral-400 font-light text-sm">Missed</h1>
                  <IncrementalButton
                    class="mb-0"
                    v-model="scoutData.teleop.netMiss"
                  />
                </div>
                <div class="text-center ml-2">
                  <h1 class="text-gray-700 dark:text-gray-200 font-bold">
                    Processor
                  </h1>
                  <h1 class="text-coral-400 font-light text-sm">Scored</h1>
                  <IncrementalButton v-model="scoutData.teleop.processor" />
                  <h1 class="text-coral-400 font-light text-sm">Missed</h1>
                  <IncrementalButton
                    class="mb-0"
                    v-model="scoutData.teleop.processorMiss"
                  />
                </div>
              </div>
            </div>
          </div>
          <!-- In this section put all the elements you want for the endgame tab -->
          <div
            v-if="gameTime == GameTime.Endgame"
            class="overflow-y-scroll max-h-80 min-h-36"
          >
            <!-- a multi select custom component. this acts like the single select but allows you to select multiple buttons at a time.
        the connection options optional param allows you to configure which options are allowed to be selected with each other
        notice the @update: which runs the updateEndgameOptions() function upon each update of the custom component-->
            <MultiSelect
              :model-value="[1, 0, 0, 0, 0, 0]"
              :options="endgameOptions"
              @update:model-value="
                value => {
                  updateEndgameOptions(value);
                }
              "
              :connected-options="[1, 2, 2, 3, 2, 4]"
            />
          </div>
          <!-- In this section put all the elements you want in the notes tab -->
          <div
            v-if="gameTime == GameTime.Notes"
            class="overflow-y-scroll max-h-80 min-h-36"
          >
            <!-- A UAccordion is a grouping of different dropdowns
        in this case, it is used to allow for different categories-->
            <UAccordion
              open-icon="i-heroicons-plus"
              close-icon="i-heroicons-minus"
              :items="[
                { label: 'Offense', slot: 'offense' },
                { label: 'Defense', slot: 'defense' },
                { label: 'Driver', slot: 'driver' },
                { label: 'Robustness', slot: 'robustness' },
              ]"
            >
              <!-- templates fill the UAccordion's sections -->
              <template #offense>
                <!-- the PromptedNote custom component takes in an array of questions and how many lines should be expected as output for that question
            for example: 'Where did this team play defense?' is the question while '1' is the number of lines expected for that response
            it then returns an array of answers to the questions which is updated to the scoutData variable
             These are stored in an object under /utils/promptedNoteOptions and used below -->
                <PromptedNote
                  v-model="scoutData.notes.promptedNotes[0]"
                  :questions="promptedNoteOptions[0].questions"
                />
              </template>
              <template #defense>
                <PromptedNote
                  v-model="scoutData.notes.promptedNotes[1]"
                  :questions="promptedNoteOptions[1].questions"
                />
              </template>
              <template #driver>
                <PromptedNote
                  v-model="scoutData.notes.promptedNotes[2]"
                  :questions="promptedNoteOptions[2].questions"
                />
              </template>
              <template #robustness>
                <PromptedNote
                  v-model="scoutData.notes.promptedNotes[3]"
                  :questions="promptedNoteOptions[3].questions"
                />
              </template>
            </UAccordion>
          </div>
          <template #footer>
            <!-- A general notes area using the NUXT UI UTextarea-->
            <UTextarea
              v-model="scoutData.notes.notes"
              color="red"
              placeholder="Other notes..."
            />
            <br />
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
                  :disabled="!isValidNum()"
                  @click="submit"
                />
              </div>
            </div>
          </template>
        </UCard>
      </div>
    </UCard>
  </div>
</template>

<style scoped></style>
