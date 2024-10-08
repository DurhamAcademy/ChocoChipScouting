<script setup lang="ts">
import { ref } from 'vue';
import PouchDB from 'pouchdb';
import databases, { type TeamInfo } from '~/utils/databases';
import OuterComponents from '~/components/website-utils/OuterComponents.vue';
let syncDisable = ref(false);

async function sync() {
  syncDisable.value = true;
  await PouchDB.sync(
    databases.locals.scoutingData,
    databases.remotes.scoutingData,
  );
  await PouchDB.sync(databases.locals.basic, databases.remotes.basic);
  await PouchDB.sync(
    databases.locals.attachments,
    databases.remotes.attachments,
  );
  await PouchDB.sync(databases.locals.teamInfo, databases.remotes.teamInfo);
  syncDisable.value = false;
}

let date = new Date();
const rankings = ref<any[]>([]);
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

let items = [
  {
    label: 'Upcoming Events',
    slot: 'upcoming',
  },
  {
    label: 'Past Events',
    slot: 'past',
  },
];

const { attachments } = databases.locals;
const db = attachments;
const robotAttachments = ref<
  {
    attachmentURL: string;
    attachmentID: string;
    tagList: string[];
    notes: string;
    fileName: string;
    fileSize: string;
    event: string;
    author: string | undefined;
    dateUploaded: string;
    attachmentHovered: boolean;
  }[]
>([]);

const events = ref<any[]>([]);
const teamEventData = ref<any[]>([]);
const upcomingEvents = ref<any[]>([]);
const pastEvents = ref<any[]>([]);
const currentRankings = ref<any[]>([]);
const currentTeamRanking = ref<any[]>();
const displayRankings = ref(false);
const currentEvent = ref(false);

const { data: eventsData, pending: eventsPending } = await useLazyFetch<
  Array<any>
>('/api/teamEvents/frc6502');

// when events are successfully fetched
watch(eventsPending, async () => {
  if (eventsData.value) {
    // sorting by time
    eventsData.value.sort(
      (b, a) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime(),
    );
    upcomingEvents.value = eventsData.value.filter(event => {
      new Date(event.end_date) > date;
    });
    pastEvents.value = eventsData.value.filter(event => {
      return new Date(event.end_date) < date;
    });
    // making a list of promises
    const promises = eventsData.value.map(async event => {
      let startDate = new Date(event.start_date);
      let endDate = new Date(event.end_date);
      let addedDate = new Date(addDays(new Date(event.end_date), 2));
      if (addedDate < date) {
        const teamRankings = await $fetch<Array<any>>(
          '/api/eventRankings/' + event.key,
        );
        rankings.value.push([teamRankings, event.end_date, event.name]);
        events.value.push(event.name);
      } else if (startDate < date && addedDate > date) {
        const teamRankings = await $fetch<Array<any>>(
          '/api/eventRankings/' + event.key,
        );
        currentRankings.value.push([teamRankings, event.name]);
        currentEvent.value = true;
        if (date > endDate) {
          rankings.value.push([teamRankings, event.end_date, event.name]);
          events.value.push(event.name);
        }
      }
    });
    if (promises) {
      // when the promises are done, I will sort through the data
      await Promise.all(promises);
      rankings.value.sort(
        (b, a) => new Date(a[1]).getTime() - new Date(b[1]).getTime(),
      );
      // getting placement data for each event for team 6502
      for (let ranking of rankings.value) {
        let temp = [];
        for (let rank of ranking[0].rankings) {
          if (rank.team_key == 'frc6502') {
            temp = rank;
          }
        }
        teamEventData.value.push(temp);
      }
      if (
        currentRankings.value.length > 0 &&
        currentRankings.value[0][0].rankings.length !== 0
      ) {
        for (let ranking of currentRankings.value[0][0].rankings) {
          if (ranking?.team_key === 'frc6502') {
            currentTeamRanking.value = ranking;
          }
        }
        displayRankings.value = currentRankings.value[0][0].rankings.length > 0;
      }
    }
  }
});

// robot attachments from attachments db
let allDocs = await db.allDocs({ include_docs: true });
allDocs.rows.forEach(async row => {
  const doc = row.doc;
  if (doc && doc.tags.includes('robot') && doc.teamNumber == 6502) {
    let attachment = await db.getAttachment(doc._id, doc.name);
    if (attachment instanceof Blob) {
      let file = new File([attachment], doc.name, { type: attachment.type });
      robotAttachments.value.push({
        attachmentURL: URL.createObjectURL(file),
        attachmentID: doc._id,
        tagList: doc.tags,
        notes: doc.extraNotes,
        fileName: doc.name,
        fileSize: doc.fileSize,
        event: doc.event,
        author: doc.author,
        dateUploaded: doc.dateUploaded,
        attachmentHovered: false,
      });
    }
  }
});

// takes a number and returns a place ex: 5 -> 5th
function placeify(place: number) {
  if (place > 3 && place < 21) return place + 'th';
  let temp = place;
  while (temp >= 10) {
    temp %= 10;
  }
  switch (temp % 10) {
    case 1:
      return place + 'st';
    case 2:
      return place + 'nd';
    case 3:
      return place + 'rd';
    default:
      return place + 'th';
  }
}

function addDays(date: Date, days: number) {
  date.setDate(date.getDate() + days);
  return date;
}

//TODO find more perm fix
//updateTeamData()

async function updateTeamData() {
  try {
    let previouslySavedTeamNums: number[] = [];
    let { teamInfo: db } = databases.locals;
    //gets all the teamsData docs from the database and adds them to one array
    let dbTeams = (await db.allDocs()).rows.map(
      async (doc): Promise<TeamInfo> => {
        return db.get(doc.id);
      },
    );
    Promise.all(dbTeams)
      .then((teams: Array<TeamInfo>) => {
        previouslySavedTeamNums = teams.map(value => {
          return value.teamNum;
        });
      })
      .then(async () => {
        //goes through each event and checks if they have any teams that aren't in the db already
        let newTeams: Array<TeamInfo> = [];
        for (let event of eventOptions) {
          const { data: tbaEventData } = await useFetch<Array<any>>(
            '/api/eventTeams/' + event,
          );
          if (tbaEventData.value != null) {
            if (tbaEventData.value.hasOwnProperty('Error')) continue;
            for (let team of tbaEventData.value) {
              let teamDataObj: TeamInfo = {
                teamNum: parseInt(team.key.replace('frc', '')),
                teamName: team.nickname,
              };
              if (previouslySavedTeamNums.includes(teamDataObj.teamNum))
                continue;
              newTeams.push(teamDataObj);
            }
          } else {
            console.error('Ruh roh! There seems to have been an issue');
          }
        }
        if (newTeams.length > 0) {
          await db.bulkDocs(newTeams);
        }
      });
  } catch {
    console.error('An error occurred');
  }
}
</script>

<template>
  <OuterComponents>
    <UButton
      class="mr-3 mt-3 right-0 absolute"
      @click="sync"
      :disabled="syncDisable"
      :loading="syncDisable"
    >
      Sync Databases
    </UButton>
    <div class="px-5 max-w-2xl min-w-lg flex-grow m-auto">
      <div
        class="w-full my-8 text-center font-sans font-bold !text-primary text-5xl"
      >
        ChocoChips Scouting
      </div>
      <UCard
        class="mb-8 px-4 pb-4"
        v-if="displayRankings"
      >
        <div class="font-bold text-center text-lg justify-center">
          <p class="">{{ currentRankings[0][1] }}</p>
          <p class="!text-primary">Team 6502 Stats</p>
        </div>
        <div class="flex justify-center my-1">
          <UButton
            class="rounded-2xl mx-0.5"
            color="gray"
            variant="outline"
            :label="placeify(currentTeamRanking.rank) + ' Place'"
          />
          <UButton
            class="rounded-2xl mx-0.5"
            color="gray"
            variant="outline"
            :label="`Record: ${currentTeamRanking.record.wins}-${currentTeamRanking.record.losses}-${currentTeamRanking.record.ties}`"
          />
          <UButton
            class="rounded-2xl mx-0.5"
            color="gray"
            variant="outline"
            :label="`Matches Played: ${currentTeamRanking.matches_played}`"
          />
        </div>
        <div class="overflow-y-auto h-60 rounded-md mt-2">
          <table class="rounded-md w-full">
            <thead class="bg-gray-200 sticky top-0">
              <tr class="">
                <th class="px-7 py-4">Rank</th>
                <th class="px-7 py-4">Team #</th>
                <th class="px-7 py-4">Record</th>
                <th class="px-7 py-4">Matches Played</th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="text-center even:bg-gray-100"
                v-for="rank of currentRankings[0][0].rankings"
              >
                <td
                  v-if="rank.rank == 1"
                  class="text-yellow-600 font-medium whitespace-nowrap px-6 py-4"
                >
                  {{ rank.rank }}
                </td>
                <td
                  v-else-if="rank.rank == 2"
                  class="text-gray-500 font-medium whitespace-nowrap px-6 py-4"
                >
                  {{ rank.rank }}
                </td>
                <td
                  v-else-if="rank.rank == 3"
                  class="text-amber-900 font-medium whitespace-nowrap px-6 py-4"
                >
                  {{ rank.rank }}
                </td>
                <td
                  v-else
                  class="whitespace-nowrap px-6 py-4 font-medium"
                >
                  {{ rank.rank }}
                </td>
                <td class="whitespace-nowrap px-6 py-4 font-medium">
                  {{ rank.team_key.replace('frc', '')
                  }}<!--<UButton @click="navigateTo({ path: `/teams/${rank.team_key.replace('frc', '')}`})" variant="ghost" color="gray" icon="i-heroicons-document-chart-bar" class="align-middle ml-1" />-->
                </td>
                <td class="whitespace-nowrap px-6 py-4 font-medium">
                  {{
                    `${rank.record.wins}-${rank.record.losses}-${rank.record.ties}`
                  }}
                </td>
                <td class="whitespace-nowrap px-6 py-4 font-medium">
                  {{ rank.matches_played }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
      <UCard class="mb-8">
        <UTabs
          :items="items"
          class="w-full max-h-52 overflow-hidden"
        >
          <template #past="{ item }">
            <div class="h-40 overflow-y-auto px-4 rounded-md">
              <div
                v-for="(event, index) in pastEvents"
                class="bg-gray-100 rounded-md"
              >
                <div class="my-2 p-2">
                  <p class="font-medium">{{ event.name }}</p>
                  <UButton
                    class="rounded-full my-0.5"
                    icon="i-heroicons-map-pin-solid"
                    :label="
                      event.city +
                      ', ' +
                      event.state_prov +
                      ', ' +
                      event.country
                    "
                    :to="event.gmaps_url"
                    target="_blank"
                    variant="outline"
                  />
                  <div class="flex my-0.5">
                    <UButton
                      class="rounded-full mx-0.5"
                      icon="i-heroicons-calendar-days-solid"
                      variant="outline"
                      color="gray"
                    />
                    <UButton
                      v-if="typeof event.week === 'number'"
                      class="rounded-full mx-0.5 mr-1"
                      :label="'Week ' + (parseInt(event.week) + 1)"
                      color="gray"
                      variant="outline"
                    />
                    <p class="my-auto mx-0.5">
                      {{
                        months.at(event.start_date.split('-')[1] - 1) +
                        ' ' +
                        parseInt(event.start_date.split('-')[2]) +
                        ', ' +
                        event.start_date.split('-')[0]
                      }}
                      -
                      {{
                        months.at(event.end_date.split('-')[1] - 1) +
                        ' ' +
                        parseInt(event.end_date.split('-')[2]) +
                        ', ' +
                        event.end_date.split('-')[0]
                      }}
                    </p>
                  </div>
                  <UPopover
                    v-if="
                      teamEventData[index] != undefined &&
                      teamEventData[index].length != 0
                    "
                  >
                    <div class="flex">
                      <UButton
                        icon="i-heroicons-presentation-chart-bar"
                        variant="outline"
                        class="rounded-full mx-0.5 mr-1"
                        color="primary"
                      />
                      <p class="my-auto mx-0.5 font-sans">
                        {{ placeify(teamEventData[index].rank) }} Place with a
                        Record of
                        {{
                          `${teamEventData[index].record.wins}-${teamEventData[index].record.losses}-${teamEventData[index].record.ties}`
                        }}
                      </p>
                    </div>
                    <template #panel>
                      <div class="overflow-y-auto h-80 pb-4">
                        <table class="rounded-md">
                          <thead class="bg-gray-200 sticky top-0">
                            <tr class="p-2">
                              <th class="px-6 py-4">Rank</th>
                              <th class="px-6 py-4">Team #</th>
                              <th class="px-6 py-4">Record</th>
                              <th class="px-6 py-4">Matches Played</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="rank of rankings[index][0].rankings"
                              class="text-center even:bg-gray-100"
                            >
                              <td
                                v-if="rank.rank == 1"
                                class="text-yellow-600 font-medium whitespace-nowrap px-6 py-4"
                              >
                                {{ rank.rank }}
                              </td>
                              <td
                                v-else-if="rank.rank == 2"
                                class="text-gray-500 font-medium whitespace-nowrap px-6 py-4"
                              >
                                {{ rank.rank }}
                              </td>
                              <td
                                v-else-if="rank.rank == 3"
                                class="text-amber-900 font-medium whitespace-nowrap px-6 py-4"
                              >
                                {{ rank.rank }}
                              </td>
                              <td
                                v-else
                                class="whitespace-nowrap px-6 py-4 font-medium"
                              >
                                {{ rank.rank }}
                              </td>
                              <td
                                class="whitespace-nowrap px-6 py-4 font-medium"
                              >
                                {{ rank.team_key.replace('frc', '') }}
                              </td>
                              <td
                                class="whitespace-nowrap px-6 py-4 font-medium"
                              >
                                {{
                                  `${rank.record.wins}-${rank.record.losses}-${rank.record.ties}`
                                }}
                              </td>
                              <td
                                class="whitespace-nowrap px-6 py-4 font-medium"
                              >
                                {{ rank.matches_played }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </template>
                  </UPopover>
                </div>
              </div>
            </div>
          </template>
          <template #upcoming="{ item }">
            <div
              class="h-32 overflow-y-auto px-4 rounded-md"
              v-if="upcomingEvents.length > 0"
            >
              <div
                v-for="event in upcomingEvents"
                class="bg-gray-100 rounded-md"
              >
                <div class="my-2 p-2">
                  <p class="font-medium">{{ event.name }}</p>
                  <UButton
                    class="rounded-full my-0.5"
                    icon="i-heroicons-map-pin-solid"
                    :label="
                      event.city +
                      ', ' +
                      event.state_prov +
                      ', ' +
                      event.country
                    "
                    :to="event.gmaps_url"
                    target="_blank"
                    variant="outline"
                  />
                  <div class="flex my-0.5">
                    <UButton
                      class="rounded-full mx-0.5"
                      icon="i-heroicons-calendar-days-solid"
                      variant="outline"
                      color="gray"
                    />
                    <UButton
                      class="rounded-full mx-0.5 mr-1"
                      :label="'Week ' + (parseInt(event.week) + 1)"
                      color="gray"
                      variant="outline"
                    />
                    <p class="my-auto mx-0.5 mr-1">
                      {{
                        months.at(event.start_date.split('-')[1] - 1) +
                        ' ' +
                        parseInt(event.start_date.split('-')[2]) +
                        ', ' +
                        event.start_date.split('-')[0]
                      }}
                      -
                      {{
                        months.at(event.end_date.split('-')[1] - 1) +
                        ' ' +
                        parseInt(event.end_date.split('-')[2]) +
                        ', ' +
                        event.end_date.split('-')[0]
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <p class="font-medium text-xl text-center">No Events Scheduled</p>
              <NuxtImg
                src="/sadcookie.png"
                class="mx-auto"
                width="145"
                height="145"
              />
            </div>
          </template>
        </UTabs>
      </UCard>
      <UCard v-if="robotAttachments.length > 0">
        <UCarousel
          v-slot="{ item, index }"
          :items="robotAttachments"
          :ui="{
            item: 'basis-full justify-center',
            container: 'rounded-lg ',
          }"
          arrows
          class="w-full px-4 max-h-96"
          :prev-button="{
            color: 'primary',
            variant: 'ghost',
            icon: 'i-heroicons-arrow-left-20-solid',
            class: '-left-4',
          }"
          :next-button="{
            color: 'primary',
            variant: 'ghost',
            icon: 'i-heroicons-arrow-right-20-solid',
            class: '-right-4',
          }"
        >
          <NuxtImg
            :src="item.attachmentURL"
            draggable="false"
            class="object-contain overflow-hidden rounded-lg"
          />
        </UCarousel>
      </UCard>
    </div>
  </OuterComponents>
</template>

<style scoped></style>
