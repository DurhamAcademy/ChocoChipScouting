<script lang="ts" setup>
import databases from '~/utils/databases';
import IncrementalButton from '~/components/scouting-components/IncrementalButton.vue';
import BooleanButton from '~/components/scouting-components/BooleanButton.vue';
import MultiSelect from '~/components/scouting-components/MultiSelect.vue';
import PromptedNote from '~/components/scouting-components/PromptedNote.vue';
import SingleSelect from '~/components/scouting-components/SingleSelect.vue';
import Navbar from '~/components/website-utils/Navbar.vue';
import { eventOptions } from '~/utils/eventOptions';
import type { Ref } from '@vue/reactivity';
import type { UnwrapRef } from 'vue';
import { loginStateKey } from '~/utils/keys';
import { useEventKey } from '~/composables/useEventKey';

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
  'Attempted Onstage',
  'Onstage',
  'Harmony',
];
//Auto Modal Image
const isOpen = ref(false);

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

//all the data collected on the scout page in the form of a ScoutingData object,
// you can edit this in the utils/databases.ts file
let scoutData = ref<ScoutingData>({
  event: '',
  teamNumber: '',
  matchNumber: '',
  author: '',
  auto: {
    speakerNA: 0,
    amp: 0,
    missedAmp: 0,
    missedSpeaker: 0,
    mobility: false,
    position: 0,
  },
  teleop: {
    amp: 0,
    speakerNA: 0,
    missedAmp: 0,
    missedSpeaker: 0,
  },
  endgame: {
    trap: 0,
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
    await navigateTo('/matches');
  }
}
</script>

<template>
  <Navbar scout-mode></Navbar>
  <div class="flex justify-center">
    <UCard class="max-w-xl flex-grow m-5">
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
                  >not found</span
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
      <div v-if="gameTime == GameTime.Autonomous">
        <div class="flex text-center">
          <div class="max-w-24 w-24">
            <h1
              class="text-gray-700 dark:text-gray-200 font-sans mr-3 mb-1 font-bold underline"
            >
              Amp
            </h1>
            <h1 class="text-coral-400 font-sans mr-3 mt-1 font-light text-sm">
              Scored
            </h1>
            <!-- (- 0 +) button for scoring that updates the scoutData under the auto tab.
            amp is the 2024 game's name for a scoring method -->
            <IncrementalButton
              class="mb-1 mr-3 mt-1"
              v-model="scoutData.auto.amp"
            ></IncrementalButton>
            <br />
            <h1 class="text-coral-400 font-sans mr-3 mt-1 font-light text-sm">
              Missed
            </h1>
            <!-- we decided it was easiest to separate scoring and missing this year
            so this does the same thing as the above incremental button but for missed shots -->
            <IncrementalButton
              class="mb-0 mr-3 mt-1"
              v-model="scoutData.auto.missedAmp"
            ></IncrementalButton>
          </div>
          <div class="max-w-24 w-24">
            <h1
              class="text-gray-700 dark:text-gray-200 font-sans mr-3 mb-1 font-bold underline"
            >
              Speaker
            </h1>
            <h1 class="text-coral-400 font-sans mr-3 mt-1 font-light text-sm">
              Scored
            </h1>
            <!-- input method for auto and the scoring method 'speaker' for 24' season -->
            <IncrementalButton
              class="mb-1 mr-3 mt-1"
              v-model="scoutData.auto.speakerNA"
            ></IncrementalButton>
            <br />
            <h1 class="text-coral-400 font-sans mr-3 mt-1 font-light text-sm">
              Missed
            </h1>
            <!-- missed points for speaker -->
            <IncrementalButton
              class="mb-0 mr-3 mt-1"
              v-model="scoutData.auto.missedSpeaker"
            ></IncrementalButton>
          </div>
          <div>
            <br />
            <br />
            <!-- a true/false button (custom component) -->
            <BooleanButton
              class="mt-1"
              v-model="scoutData.auto.mobility"
              :default-value="'Mobility'"
              :other-value="'Mobility'"
            />
          </div>
        </div>
        <div class="ml-6">
          <br />
          <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">
            Auto Position
          </h1>
        </div>
        <div>
          <!-- a single selection among multiple options custom component.
          used for the starting position of the team's robot during auto -->
          <SingleSelect
            v-model="scoutData.auto.position"
            :options="['1', '2', '3', '4']"
          />
          <!-- a button that opens a reference image for the previous element, a
           starting position selector -->
          <UButton
            class="ml-1"
            @click="isOpen = true"
            label="Reference"
          />
        </div>
      </div>
      <!-- the popup for the reference image -->
      <UModal v-model="isOpen">
        <div class="flex flex-auto">
          <UButton
            class="mr-2 mt-2 right-0 absolute"
            @click="isOpen = false"
            icon="i-heroicons-x-circle"
          />
          <img src="/public/referenceImage.png" />
        </div>
      </UModal>

      <!-- In this section put all the elements you want to be shown under the teleop tab -->
      <div v-if="gameTime == GameTime.Teleoperated">
        <div class="flex text-center">
          <div class="max-w-24 w-24">
            <h1
              class="text-gray-700 dark:text-gray-200 font-sans mr-3 mb-1 font-bold underline"
            >
              Amp
            </h1>
            <h1 class="text-coral-400 font-sans mr-3 mt-1 font-light text-sm">
              Scored
            </h1>
            <!-- same thing as above incremental buttons but for teleop -->
            <IncrementalButton
              class="mb-1 mr-3 mt-1"
              v-model="scoutData.teleop.amp"
            ></IncrementalButton>
            <br />
            <h1 class="text-coral-400 font-sans mr-3 mt-1 font-light text-sm">
              Missed
            </h1>
            <IncrementalButton
              class="mb-0 mr-3 mt-1"
              v-model="scoutData.teleop.missedAmp"
            ></IncrementalButton>
          </div>
          <div class="max-w-24 w-24">
            <h1
              class="text-gray-700 dark:text-gray-200 font-sans mr-3 mb-1 font-bold underline"
            >
              Speaker
            </h1>
            <h1 class="text-coral-400 font-sans mr-3 mt-1 font-light text-sm">
              Scored
            </h1>
            <IncrementalButton
              class="mb-1 mr-3 mt-1"
              v-model="scoutData.teleop.speakerNA"
            ></IncrementalButton>
            <br />
            <h1 class="text-coral-400 font-sans mr-3 mt-1 font-light text-sm">
              Missed
            </h1>
            <IncrementalButton
              class="mb-0 mr-3 mt-1"
              v-model="scoutData.teleop.missedSpeaker"
            ></IncrementalButton>
          </div>
        </div>
      </div>
      <!-- In this section put all the elements you want for the teleop tab -->
      <div v-if="gameTime == GameTime.Endgame">
        <div class="flex text-center flex-wrap mb-3">
          <div class="max-w-24 w-24">
            <h1 class="text-gray-700 dark:text-gray-200 font-sans font-medium">
              Trap
            </h1>
            <!-- a new scoring method, but same idea as above incremental buttons -->
            <IncrementalButton
              class="mt-1"
              v-model="scoutData.endgame.trap"
              :max-value="3"
            ></IncrementalButton>
          </div>
        </div>
        <!-- a multi select custom component. this acts like the single select but allows you to select multiple buttons at a time.
        the connection options optional param allows you to configure which options are allowed to be selected with each other
        notice the @update: which runs the updateEndgameOptions() function upon each update of the custom component-->
        <MultiSelect
          :model-value="[1, 0, 0, 0, 0]"
          :options="endgameOptions"
          @update:model-value="
            value => {
              updateEndgameOptions(value);
            }
          "
          :connected-options="[1, 2, 2, 3, 3]"
        />
      </div>
      <!-- In this section put all the elements you want in the notes tab -->
      <div v-if="gameTime == GameTime.Notes">
        <!-- A UAccordion is a grouping of different dropdowns
        in this case, it is used to allow for different categories-->
        <UAccordion
          open-icon="i-heroicons-plus"
          close-icon="i-heroicons-minus"
          :items="[
            { label: 'Defense', slot: 'defense', defaultOpen: true },
            { label: 'Offense', slot: 'offense' },
            { label: 'Driver', slot: 'driver' },
          ]"
        >
          <!-- templates fill the UAccordion's sections -->
          <template #defense>
            <!-- the PromptedNote custom component takes in an array of questions and how many lines should be expected as output for that question
            for example: 'Where did this team play defense?' is the question while '1' is the number of lines expected for that response
            it then returns an array of answers to the questions which is updated to the scoutData variable -->
            <PromptedNote
              v-model="scoutData.notes.promptedNotes[0]"
              :questions="[
                ['Where did this team play defense?', 1],
                [
                  'Is this team at risk of causing fouls? If so, elaborate why.',
                  2,
                ],
                ['What other factors contributed to your rating?', 1],
              ]"
            />
          </template>
          <template #offense>
            <PromptedNote
              v-model="scoutData.notes.promptedNotes[1]"
              :questions="[
                ['Where can this team shoot from?', 1],
                [
                  'If applicable, how did the driver make efforts to avoid opposing defense?',
                  2,
                ],
                ['What slowed down their cycles?', 2],
                ['What other factors contributed to your rating?', 1],
              ]"
            />
          </template>
          <template #driver>
            <PromptedNote
              v-model="scoutData.notes.promptedNotes[2]"
              :questions="[
                ['What makes their driving strong?', 1],
                ['What makes their driving weak?', 1],
                ['What other factors contributed to your rating?', 1],
              ]"
            />
          </template>
        </UAccordion>
      </div>
      <template #footer>
        <!-- A general notes area using the NUXT UI UTextarea-->
        <UTextarea
          v-model="scoutData.notes.notes"
          color="yellow"
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
</template>

<style scoped></style>
