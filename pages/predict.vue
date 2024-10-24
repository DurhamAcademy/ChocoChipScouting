<script setup lang="ts">
import databases from '~/utils/databases';
import { eventOptions } from '~/utils/eventOptions';
import OuterComponents from '~/components/website-utils/OuterComponents.vue';

/*
The current prediction algorithm calculates average team scores, using the scoreMatch.ts file (under utils).
Then, the algorithm pairs all three alliance members together, calculating a predicted score for both alliances
and comparing them. The algorithm also checks its work throughout the competition, displaying an accuracy rating.
 */

let currentEvent = eventOptions[0];
if (typeof window !== 'undefined')
  currentEvent = localStorage.getItem('currentEvent') || eventOptions[0];

/**
 * Gets the event matches of the user's current event asynchronously
 */
const { data, pending } = await useLazyFetch<Array<any>>(
  '/api/eventMatches/' + currentEvent,
);

//gets and filters scouting data to use with predictions
const { scoutingData } = databases.locals;
let db = scoutingData;

const matches = (await db.allDocs()).rows;
let match = matches.map(async doc => {
  return await db.get(doc.id);
});

let teamOrgMatches = new Map<number, Array<any>>();

for (let i = 0; i < match.length; i++) {
  let currentMatch = await match[i];
  let team =
    typeof currentMatch.teamNumber == 'string'
      ? parseInt(currentMatch.teamNumber)
      : currentMatch.teamNumber;
  if (currentMatch.event == currentEvent) {
    if (!teamOrgMatches.has(team)) {
      teamOrgMatches.set(team, [currentMatch]);
    } else {
      let arr: Array<any> = teamOrgMatches.get(team)!;
      arr.push(currentMatch);
      teamOrgMatches.set(team, arr);
    }
  }
}
for (let teamData of teamOrgMatches) {
  let matches = teamOrgMatches.get(teamData[0]);
  let matchNumbers: number[] = [];
  if (matches) {
    for (let i = 0; i < matches.length; i++) {
      let currMatch = matches[i].matchNumber;
      if (matchNumbers.includes(currMatch)) {
        for (let i = 0; i < teamData[1].length; i++) {
          if (teamData[1][i].matchNumber == currMatch) {
            let arr = teamOrgMatches.get(teamData[0]);
            if (arr != undefined) {
              arr.splice(i, 1);
              teamOrgMatches.set(teamData[0], arr);
            }
            break;
          }
        }
      } else matchNumbers.push(currMatch);
    }
  }
}

//blue and red teams
let selectedBlueTeams = ref<Array<string>>(['', '', '']);
let selectedRedTeams = ref<Array<string>>(['', '', '']);
//which team is predicted to win
let winningTeamColor = ref(['outline-red-100', 'outline-blue-100']);
//how much the winning team is predicted to win by
let winningPercentage = ref(-1);
let teamsFound = ref([
  [false, false, false],
  [false, false, false],
]);
//blue and red total predicted points
let blueTotal = ref(0);
let redTotal = ref(0);

/**
 * Calculates the average score of a team based on their matches.
 *
 * @param {number} team - The ID of the team.
 * @return {number} - The average score of the team. Returns -1 if the team data doesn't exist.
 */
function calculateTeamAverageScore(team: number) {
  let teamMatches = teamOrgMatches.get(team);
  if (teamMatches) {
    let totalScore = 0;
    for (let match of teamMatches) {
      totalScore += scoreMatch(match);
    }
    return totalScore / teamMatches.length;
  }
  return -1;
}

/**
 * Predicts the winning team and winning percentage based on selected teams and their average scores.
 * Sets the page components to show the predicted results
 *
 * @return {void} This method does not return any value.
 */
function predict() {
  blueTotal.value = 0;
  redTotal.value = 0;
  for (let team of selectedBlueTeams.value) {
    let teamNum = parseInt(team);
    let score = 0;
    teamsFound.value[0][selectedBlueTeams.value.indexOf(team)] = false;
    if (!Number.isNaN(teamNum)) score += calculateTeamAverageScore(teamNum);
    if (score > 0) blueTotal.value += score;
    else if (score == -1) {
      teamsFound.value[0][selectedBlueTeams.value.indexOf(team)] = true;
    }
  }
  for (let team of selectedRedTeams.value) {
    let teamNum = parseInt(team);
    let score = 0;
    teamsFound.value[1][selectedRedTeams.value.indexOf(team)] = false;
    if (!Number.isNaN(teamNum)) score = calculateTeamAverageScore(teamNum);
    if (score > 0) redTotal.value += score;
    else if (score == -1) {
      teamsFound.value[1][selectedRedTeams.value.indexOf(team)] = true;
    }
  }

  let blueWinPercentage =
    (blueTotal.value / (blueTotal.value + redTotal.value)) * 100;
  if (blueWinPercentage > 50) {
    winningTeamColor.value = ['outline-red-100', 'outline-blue-300'];
    winningPercentage.value = blueWinPercentage;
  } else if (blueWinPercentage < 50) {
    winningTeamColor.value = ['outline-red-300', 'outline-blue-100'];
    winningPercentage.value = 100 - blueWinPercentage;
  } else {
    winningTeamColor.value = ['outline-red-100', 'outline-blue-100'];
    winningPercentage.value = blueWinPercentage;
  }
}

let matchNumber = ref<number>();
//TODO I dont think this is implemented properly idk tho
let playoffNumber = ref<number>();

/**
 * Populates the selected Red and Blue teams based on the provided data and match/playoff number.
 * If the pending value is false and the data value is not null, the function populates the selected teams.
 * If the matchNumber value is defined and not empty, the function populates the teams based on the match number.
 * If the playoffNumber value is defined, the function populates the teams based on the playoff number.
 * If neither matchNumber nor playoffNumber is defined, the function sets the selected teams to empty strings.
 *
 * @return {void}
 */
function populateMatch() {
  if (!pending.value && data.value != null) {
    let tbaMatchData = data.value;
    if (matchNumber.value != undefined && matchNumber.value.toString() != '') {
      let tbaMatchData = data.value;
      for (let compMatch of tbaMatchData) {
        if (
          compMatch.comp_level == 'qm' &&
          compMatch.match_number == matchNumber.value
        ) {
          for (let i = 0; i < compMatch.alliances.blue.team_keys.length; i++) {
            selectedBlueTeams.value[i] = compMatch.alliances.blue.team_keys[
              i
            ].replace('frc', '');
          }
          for (let i = 0; i < compMatch.alliances.red.team_keys.length; i++) {
            selectedRedTeams.value[i] = compMatch.alliances.red.team_keys[
              i
            ].replace('frc', '');
          }
        }
      }
    } else if (playoffNumber.value != undefined) {
      if (tbaMatchData != null) {
        for (let compMatch of tbaMatchData) {
          if (
            compMatch.comp_level == 'sf' &&
            compMatch.set_number == playoffNumber.value
          ) {
            for (
              let i = 0;
              i < compMatch.alliances.blue.team_keys.length;
              i++
            ) {
              selectedBlueTeams.value[i] = compMatch.alliances.blue.team_keys[
                i
              ].replace('frc', '');
            }
            for (let i = 0; i < compMatch.alliances.red.team_keys.length; i++) {
              selectedRedTeams.value[i] = compMatch.alliances.red.team_keys[
                i
              ].replace('frc', '');
            }
          }
        }
      }
    } else {
      selectedRedTeams.value = ['', '', ''];
      selectedBlueTeams.value = ['', '', ''];
    }
  }
}

//variables used to calculate how accurate predictions are
let totalMatches = ref(0);
let correctMatches = ref(0);

/**
 * Gets data from eventMatches call once it has returned asynchronously
 * Updates the correct matches tally
 */
watch(pending, () => {
  if (!pending.value) {
    let md = data.value;
    if (md != null) {
      let blueTeams = JSON.stringify(selectedBlueTeams.value);
      let redTeams = JSON.stringify(selectedRedTeams.value);
      let winningColor = JSON.stringify(winningTeamColor.value);
      let winPercent = JSON.stringify(winningPercentage.value);
      let tf = JSON.stringify(teamsFound.value);
      let blue = JSON.stringify(blueTotal.value);
      let red = JSON.stringify(redTotal.value);
      for (let compMatch of md) {
        if (compMatch.comp_level == 'qm') {
          for (let i = 0; i < compMatch.alliances.blue.team_keys.length; i++) {
            selectedBlueTeams.value[i] = compMatch.alliances.blue.team_keys[
              i
            ].replace('frc', '');
          }
          for (let i = 0; i < compMatch.alliances.red.team_keys.length; i++) {
            selectedRedTeams.value[i] = compMatch.alliances.red.team_keys[
              i
            ].replace('frc', '');
          }
          predict();
          if (blueTotal.value > redTotal.value) {
            if (compMatch.winning_alliance == 'blue') {
              correctMatches.value++;
            }
          } else if (blueTotal.value < redTotal.value) {
            if (compMatch.winning_alliance == 'red') {
              correctMatches.value++;
            }
          }
          totalMatches.value++;
        }
      }
      selectedBlueTeams.value = JSON.parse(blueTeams);
      selectedRedTeams.value = JSON.parse(redTeams);
      winningTeamColor.value = JSON.parse(winningColor);
      winningPercentage.value = JSON.parse(winPercent);
      teamsFound.value = JSON.parse(tf);
      blueTotal.value = JSON.parse(blue);
      redTotal.value = JSON.parse(red);
    }
  }
});
</script>

<template>
  <OuterComponents>
    <div class="flex justify-center">
      <UCard class="max-w-xl mt-5 flex-grow">
        <template #header>
          <div class="flex">
            <UInput
              v-model="matchNumber"
              class="flex-auto"
              placeholder="Match #"
            ></UInput>
            <UInput
              v-model="playoffNumber"
              class="flex-auto ml-2.5"
              placeholder="Playoff #"
            ></UInput>
            <UButton
              class="ml-2.5 flex-0"
              label="Auto Fill"
              @click="populateMatch"
            ></UButton>
            <UButton
              class="ml-2.5 flex-1"
              label="Predict"
              @click="predict"
            ></UButton>
          </div>
        </template>
        <UContainer
          :class="
            'flex bg-blue-100 p-5 rounded-sm outline outline-3 ' +
            winningTeamColor[1]
          "
        >
          <UInput
            v-model="selectedBlueTeams[0]"
            class="flex-1"
            placeholder="Team #"
          >
            <template #trailing>
              <span
                v-if="teamsFound[0][0]"
                class="text-red-400 dark:text-red-600 text-xs"
                >not found</span
              >
              <span v-else></span>
            </template>
          </UInput>
          <UInput
            v-model="selectedBlueTeams[1]"
            class="flex-1 ml-2.5"
            placeholder="Team #"
          >
            <template #trailing>
              <span
                v-if="teamsFound[0][1]"
                class="text-red-400 dark:text-red-600 text-xs"
                >not found</span
              >
              <span v-else></span>
            </template>
          </UInput>
          <UInput
            v-model="selectedBlueTeams[2]"
            class="flex-1 ml-2.5"
            placeholder="Team #"
          >
            <template #trailing>
              <span
                v-if="teamsFound[0][2]"
                class="text-red-400 dark:text-red-600 text-xs"
                >not found</span
              >
              <span v-else></span>
            </template>
          </UInput>
        </UContainer>
        <UContainer class="mt-4 mb-4">
          <div class="text-center">
            <p
              v-if="winningPercentage != -1 && !isNaN(winningPercentage)"
              class="font-semibold"
            >
              {{ blueTotal.toFixed(1) + ' - ' + redTotal.toFixed(1) }}
            </p>
            <p
              v-else
              class="font-semibold"
            >
              vs
            </p>
          </div>
        </UContainer>
        <UContainer
          :class="
            'flex bg-red-100 p-5 mt-4 rounded-sm outline outline-3 ' +
            winningTeamColor[0]
          "
        >
          <UInput
            v-model="selectedRedTeams[0]"
            class="flex-1"
            placeholder="Team #"
          >
            <template #trailing>
              <span
                v-if="teamsFound[1][0]"
                class="text-red-400 dark:text-red-600 text-xs"
                >not found</span
              >
              <span v-else></span>
            </template>
          </UInput>
          <UInput
            v-model="selectedRedTeams[1]"
            class="flex-1 ml-2.5"
            placeholder="Team #"
          >
            <template #trailing>
              <span
                v-if="teamsFound[1][1]"
                class="text-red-400 dark:text-red-600 text-xs"
                >not found</span
              >
              <span v-else></span>
            </template>
          </UInput>
          <UInput
            v-model="selectedRedTeams[2]"
            class="flex-1 ml-2.5"
            placeholder="Team #"
          >
            <template #trailing>
              <span
                v-if="teamsFound[1][2]"
                class="text-red-400 dark:text-red-600 text-xs"
                >not found</span
              >
              <span v-else></span>
            </template>
          </UInput>
        </UContainer>
        <template #footer>
          <div class="text-center text-xs">
            <p v-if="!pending">
              {{
                'Accuracy: ' +
                ((correctMatches / totalMatches) * 100).toFixed(0) +
                '%'
              }}
            </p>
            <p v-else>Accuracy: fetching...</p>
          </div>
        </template>
      </UCard>
    </div>
  </OuterComponents>
</template>

<style scoped></style>
