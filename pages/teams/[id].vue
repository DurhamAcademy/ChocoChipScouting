<script setup lang="ts">
import databases, { type ScoutingData, type TeamInfo } from '~/utils/databases';
import IdMeta = PouchDB.Core.IdMeta;
import { eventOptions } from '~/utils/eventOptions';
import { useWindowSize } from '@vueuse/core';
import MatchVisualization from '~/components/25-reefscape/MatchVisualization.vue';
import CoralVisualization from '~/components/25-reefscape/CoralVisualization.vue';
import AlgaeVisualization from '~/components/25-reefscape/AlgaeVisualization.vue';
import TeamVisualization from '~/components/25-reefscape/TeamVisualization.vue';
import {
  scoreMatchAuto,
  scoreMatchAlgae,
  scoreMatchCoral,
  scoreMatchEndgame,
} from '~/utils/scoreMatch';
import { useTeamStore } from "~/stores/useTeamStore";

let { width, height } = useWindowSize();

const colorMode = useColorMode();

let currentEvent = useEventKey();
let componentKey = ref(0) //this is a force updater
watch(currentEvent, value => {
  setup();
  try {
    localStorage.setItem('currentEvent', value);
  } catch {}
  setup();
  componentKey.value += 1;
});

const { scoutingData } = databases.locals;
let db = scoutingData;

const teamStore = useTeamStore();
onMounted(() => {
  teamStore.fetchTeams(); // Fetch teams from API or use localStorage if already available
});

const route = useRoute();

const matches = (await db.allDocs()).rows;
let match = matches.map(async (doc): Promise<ScoutingData & IdMeta> => {
  return await db.get(doc.id);
});

let teamOrgMatches = new Map<number, Array<ScoutingData & IdMeta>>();
let extraNotes = new Map<number, Array<string>>();

for (let i = 0; i < match.length; i++) {
  let currentMatch = await match[i];
  if (currentMatch.matchNumber != -1) {
    let team =
      typeof currentMatch.teamNumber == 'string'
        ? parseInt(currentMatch.teamNumber)
        : currentMatch.teamNumber;
    if (!teamOrgMatches.has(team)) {
      teamOrgMatches.set(team, [currentMatch]);
    } else {
      let arr: Array<ScoutingData & IdMeta> = teamOrgMatches.get(team)!;
      arr.push(currentMatch);
      teamOrgMatches.set(team, arr);
    }
  } else if (currentMatch.notes.notes != undefined) {
    let team =
      typeof currentMatch.teamNumber == 'string'
        ? parseInt(currentMatch.teamNumber)
        : currentMatch.teamNumber;
    if (!extraNotes.has(team)) {
      extraNotes.set(team, [currentMatch.notes.notes]);
    } else {
      let arr: Array<string> = extraNotes.get(team)!;
      arr.push(currentMatch.notes.notes);
      extraNotes.set(team, arr);
    }
  }
}

function getMaxScores() {
// auto, coral, algae, endgame
    let maxScores = [1, 1, 1, 1];
    let tempAutoScore = 0;
    let tempCoralScore = 0;
    let tempAlgaeScore = 0;
    let tempEndgameScore = 0;
    for (let team of teamOrgMatches.keys()) {
      let teamMatches = teamOrgMatches.get(team);
      if (teamMatches) {
        for (let teamMatch of teamMatches) {
          if (teamMatch.event == currentEvent.value) {
            tempAutoScore += scoreMatchAuto(teamMatch);
            tempCoralScore += scoreMatchCoral(teamMatch);
            tempAlgaeScore += scoreMatchAlgae(teamMatch);
            tempEndgameScore += scoreMatchEndgame(teamMatch);
          }
        }
        if (tempAutoScore > maxScores[0]) {
          maxScores[0] = tempAutoScore;
        }
        if (tempCoralScore > maxScores[1]) {
          maxScores[1] = tempCoralScore;
        }
        if (tempAlgaeScore > maxScores[2]) {
          maxScores[2] = tempAlgaeScore;
        }
        if (tempEndgameScore > maxScores[3]) {
          maxScores[3] = tempEndgameScore;
        }
      }
      tempAutoScore = 0;
      tempCoralScore = 0;
      tempAlgaeScore = 0;
      tempEndgameScore = 0;
    }
    return maxScores
}
let teamData = ref<{
  teamNum: number;
  teamName: string;
  rawData: any;
  penaltyScore: number;
}>({
  teamNum: 0,
  teamName: '',
  rawData: null,
  penaltyScore: 0,
});
let teamOptions = ref<Array<string>>([]);
let filterTeam = ref(route.params.id);

function setup() {
  teamOptions.value = [];
  for (let [key, value] of teamOrgMatches) {
    if (typeof key == 'string') key = parseInt(key);
    let filteredValue: (ScoutingData & IdMeta)[] = [];
    for (let match of value) {
      if (match.event === useEventKey().value) {
        if (!teamOptions.value.includes(key.toString())) {
          teamOptions.value.push(key.toString());
        }
        filteredValue.push(match);
      }
    }
    if (String(key) == filterTeam.value) {
      teamData.value = {
        teamNum: key,
        rawData: filteredValue,
        teamName: '',
        penaltyScore: 0,
      };
    }
  }
  //TODO, given changes to teamOptions array, this may now need a sort function that uses parseInt to sort
  teamOptions.value.sort();
  findTeamName();
}
setup();

function findTeamName() {
  let eventInfo: EventData[] = teamStore.events;
  let currentEventIndex: number = eventInfo.findIndex(
    event => event.eventKey === currentEvent.value,
  );
  if (currentEventIndex !== -1) {
    // gets all TeamInfo (team # and team name) at the current event
    let allEventTeamInfo: TeamInfo[] = eventInfo[currentEventIndex].teamInfo;
    // gets the TeamInfo of the current team this page is on
    let currentTeamsInfo = allEventTeamInfo.find(
      info => info.teamNum === teamData.value.teamNum,
    );
    // if this team exists at the event, update the team name
    if (currentTeamsInfo) {
      teamData.value.teamName = currentTeamsInfo.teamName;
    }
  }
}

const { data: tbaMatchData, pending: tbaPending } = useLazyFetch<Array<any>>(
  '/api/eventMatches/' + currentEvent.value,
);
function getTeamPenaltyCount() {
  if (!tbaPending.value && tbaMatchData.value != null) {
    let teamsMap = new Map();
    for (let match of tbaMatchData.value) {
      if (match.comp_level == 'qm') {
        for (let team of match.alliances.red.team_keys) {
          let teamNum = parseInt(team.substring(3));
          if (teamsMap.has(teamNum)) {
            let increasedValues = [
              teamsMap.get(teamNum)[0] +
                (match.score_breakdown.red.foulCount +
                  match.score_breakdown.red.techFoulCount) /
                  3,
              teamsMap.get(teamNum)[1] + 1,
            ];
            teamsMap.set(teamNum, increasedValues);
          } else {
            teamsMap.set(teamNum, [
              (match.score_breakdown.red.foulCount +
                match.score_breakdown.red.techFoulCount) /
                3,
              1,
            ]);
          }
        }
        for (let team of match.alliances.blue.team_keys) {
          let teamNum = parseInt(team.substring(3));
          if (teamsMap.has(teamNum)) {
            let increasedValues = [
              teamsMap.get(teamNum)[0] +
                (match.score_breakdown.blue.foulCount +
                  match.score_breakdown.blue.techFoulCount) /
                  3,
              teamsMap.get(teamNum)[1] + 1,
            ];
            teamsMap.set(teamNum, increasedValues);
          } else {
            teamsMap.set(teamNum, [
              (match.score_breakdown.blue.foulCount +
                match.score_breakdown.blue.techFoulCount) /
                3,
              1,
            ]);
          }
        }
      }
    }
    return teamsMap;
  }
  return new Map();
}

let upperQuarterCutoff = ref(1);

watch(tbaPending, value => {
  if (!value) {
    let map = getTeamPenaltyCount();
    let valuesArr = Array.from(map.values());
    let percentile = 0.75;
    let calculatedValuesArr = valuesArr.map((value: Array<number>) => {
      return value[0] / value[1] || 0;
    });
    calculatedValuesArr.sort();
    upperQuarterCutoff.value =
      calculatedValuesArr[Math.floor(valuesArr.length * percentile)];
    let teamNum = filterTeam.value + '';
    if (map.has(parseInt(teamNum))) {
      let mapValues = map.get(parseInt(teamNum));
      teamData.value.penaltyScore = mapValues[0] / mapValues[1] || 0;
    }
  }
});

async function goBack() {
  navigateTo('/teams/');
}

let margin = ref(width.value > 800 ? 'ml-2' : '');
watch(width, () => {
  margin.value = width.value > 800 ? 'ml-2' : 'mt-4';
});
</script>

<template>
  <UCard class="w-full h-full rounded-none dark:bg-gray-800">
    <template #header>
      <UButton
        class="absolute left-2 top-2"
        variant="ghost"
        size="xl"
        icon="i-heroicons-arrow-left"
        @click="goBack"
      />
      <div class="text-center justify-center dark:!text-primary">
        <UTooltip
          :text="'Avg Penalties: ' + teamData.penaltyScore.toFixed(2)"
          :popper="{ offsetDistance: -2 }"
        >
          <div>
            <svg
              v-if="teamData.penaltyScore > upperQuarterCutoff"
              class="mb-2 mr-1 inline-block stroke-rose-500 fill-rose-200 w-6 h-6"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                clip-rule="evenodd"
              />
            </svg>
            <h1 class="inline-block font-extrabold text-2xl mb-2">
              {{
                teamData.teamName != ''
                  ? teamData.teamNum + ' - ' + teamData.teamName
                  : teamData.teamNum
              }}
            </h1>
          </div>
        </UTooltip>
        <div class="mx-auto flex justify-center align-center">
          <UInputMenu
            v-model="filterTeam"
            :options="teamOptions"
            @change="navigateTo('/teams/' + filterTeam)"
            class="max-w-36 w-36 flex-auto h-8"
            placeholder="Select a team"
          />
          <USelectMenu
            v-model="currentEvent"
            :options="eventOptions"
            class="max-w-36 w-36 flex-auto h-8 ml-3"
          />
        </div>
      </div>
    </template>
    <div
      class="flex flex-wrap"
      v-if="teamData.rawData.length > 0"
    >
      <div class="h-1/3 lg:w-2/3 w-full">
        <MatchVisualization :row-data="teamData"></MatchVisualization>
      </div>
      <div class="flex-auto w-full lg:w-1/4 h-1/3 mt-4 lg:mt-0 lg:ml-4">
        <TeamVisualization
          :team-data="teamData"
          :maxScores="getMaxScores()"
          :key="componentKey"
        />
      </div>
      <div class="flex-auto w-full lg:w-1/3 h-min max-h-min flex-wrap pt-4">
        <CoralVisualization
          :row-data="teamData"
          :key="componentKey"
        />
      </div>
      <div
        class="pt-4 flex-auto w-full lg:w-1/3 h-min max-h-min flex-wrap lg:ml-4"
      >
        <AlgaeVisualization
          :row-data="teamData"
          :key="componentKey"
        />
      </div>
    </div>
    <div
      v-else
      class="opacity-50"
    >
      <img
        v-if="colorMode.value === 'light'"
        src="/sadcookie.png"
        class="mx-auto"
        width="145"
        height="145"
        alt="No results found"
      />
      <img
        v-else
        src="/angrycookie.png"
        class="mx-auto"
        width="145"
        height="145"
        alt="No results found"
      />
      <h1 class="font-sans text-xl font-bold text-center dark:text-white">
        Looks like there is no data on team {{ teamData.teamNum }} at
        {{ currentEvent }} :(
      </h1>
    </div>
  </UCard>
</template>

<style scoped></style>
