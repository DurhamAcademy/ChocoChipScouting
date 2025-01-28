<script setup lang="ts">
import databases, {
  type DataArrayOrSum,
  type ScoutingData,
  type TeamTableData,
} from '~/utils/databases';
import IdMeta = PouchDB.Core.IdMeta;
import { useWindowSize } from '@vueuse/core';
import PieChart from '~/components/charts/PieChart.vue';
import OuterComponents from '~/components/website-utils/OuterComponents.vue';
import { TokenFormat } from 'vscode-languageserver-protocol';

//TYLER IS THIS NEEDED IDK
let { width, height } = useWindowSize();

let currentEvent = useEventKey();
watch(currentEvent, () => {
  tableSetup();
});


let filterOptions = ['Team #', 'Match #', '-Author'];
let activeFilterOption = ref(filterOptions[0]);
let filterInput = ref('');
let activeFilters = ref<Array<string>>([]);

function addFilter() {
  if (filterInput.value != '') {
    activeFilters.value.push(
      activeFilterOption.value + ': ' + filterInput.value,
    );
    filterInput.value = '';
  }
}

watch(
  activeFilters,
  async () => {
    await tableSetup();
  },
  {
    deep: true,
  },
);

const { scoutingData: db } = databases.locals;

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

let teamsData = ref<any>([]);

async function tableSetup() {
  teamsData.value.length = 0;

  /*
  Creates two arrays that are filters applied on all data for team numbers and events (includes match number filter)
   */
  let blueAlliance = [];
  let redAlliance = [];
  let allowedTeams: string[] = [];
  let bannedAuthors: string[] = [];

  for (let filter of activeFilters.value) {
    if (filter.startsWith(filterOptions[0])) {
      allowedTeams.push(filter.split(':')[1].trim());
    }
    if (filter.startsWith(filterOptions[2])) {
      bannedAuthors.push(filter.split(':')[1].trim());
    }
    if (filter.startsWith(filterOptions[1])) {
      let tbaMatchData = fetch.data.value;
      if (tbaMatchData != null) {
        let userInput = filter.split(':')[1].trim();
        for (let match of tbaMatchData) {
          if (match.comp_level == 'qm' && match.match_number == userInput) {
            for (let team of match.alliances.blue.team_keys) {
              let cleanedTeam = team.replace('frc', '');
              if (!allowedTeams.includes(cleanedTeam)) {
                allowedTeams.push(cleanedTeam);
                blueAlliance.push(cleanedTeam);
              }
            }
            for (let team of match.alliances.red.team_keys) {
              let cleanedTeam = team.replace('frc', '');
              if (!allowedTeams.includes(cleanedTeam)) {
                allowedTeams.push(cleanedTeam);
                redAlliance.push(cleanedTeam);
              }
            }
          }
        }
      }
    }
  }
  tableLoop: for (let [key, value] of teamOrgMatches) {
    if (key == undefined) continue;
    /*
    Data is an array of all matches, associated with a team (key), for the event filters selected
     */
    let data: Array<ScoutingData & IdMeta> = [];
    //if sorted by match apply alliance colors
    let alliance = blueAlliance.includes(key.toString())
      ? 'bg-blue-100'
      : redAlliance.includes(key.toString())
      ? 'bg-red-100'
      : '';
    if (allowedTeams.length == 0 || allowedTeams.includes(key.toString())) {
      for (let match of value) {
        if (
          match.event != undefined &&
          currentEvent.value == match.event &&
          !bannedAuthors.includes(match.author)
        ) {
          data.push(match);
        }
      }
    }

    let teamExtraNotes = extraNotes.get(key);
    if (teamExtraNotes == undefined) teamExtraNotes = [];

    /*
    Removes match overlaps
     */
    let matchNumbers: number[] = [];
    for (let value of data) {
      let currMatch = value.matchNumber;
      if (matchNumbers.includes(currMatch)) {
        let includedOne = false;
        for (let i = data.length - 1; i >= 0; i--) {
          if (data[i].matchNumber == currMatch) {
            //switch to prioritizing your org not just darc side
            if (includedOne) {
              data.splice(data.indexOf(data[i]), 1);
            } else includedOne = true;
          }
        }
      } else matchNumbers.push(currMatch);
    }

    if (data.length > 0) {
      let arr = {
        team: { data: String(key), color: '' },
        driver: {
          data: Math.round(averageDriverScore(data) * 100) / 100,
          color: '',
        },
        defense: {
          data: Math.round(averageDefensiveScore(data) * 100) / 100,
          color: '',
        },
        netAuto: {
          data: Math.round(averageNetAuto(data) * 100) / 100,
          color: '',
        },
        netAutoAccData: netAutoAccuracy(data),
        netAutoAcc: {
          data: !isNaN(+netAutoAccuracy(data)[1])
            ? Math.round(+netAutoAccuracy(data)[1] * 1000) / 10 + '%'
            : '0%',
          color: '',
        },
        processorAuto: {
          data: Math.round(averageProcessorAuto(data) * 100) / 100,
          color: '',
        },
        processorAutoAccData: processorAutoAccuracy(data),
        processorAutoAcc: {
          data: !isNaN(+processorAutoAccuracy(data)[1])
            ? Math.round(+processorAutoAccuracy(data)[1] * 1000) / 10 + '%'
            : '0%',
          color: '',
        },
        reefAutoAccData: reefAutoAccuracy(data),
        reefAutoAcc: {
          data: !isNaN(+reefAutoAccuracy(data)[1])
            ? Math.round(+reefAutoAccuracy(data)[1] * 1000) / 10 + '%'
            : '0%',
          color: '',
        },
        coralL1Auto: {
          data: Math.round(averageCoralL1Auto(data) * 100) / 100,
          color: '',
        },
        coralL2Auto: {
          data: Math.round(averageCoralL2Auto(data) * 100) / 100,
          color: '',
        },
        coralL3Auto: {
          data: Math.round(averageCoralL3Auto(data) * 100) / 100,
          color: '',
        },
        coralL4Auto: {
          data: Math.round(averageCoralL4Auto(data) * 100) / 100,
          color: '',
        },
        reefAuto: {
          data: Math.round(averageReefAuto(data) * 100) / 100,
          color: '',
        },
        coralL1AutoAccData: coralL1AutoAccuracy(data),
        coralL1AutoAcc: {
          data: !isNaN(+coralL1AutoAccuracy(data)[1])
            ? Math.round(+coralL1AutoAccuracy(data)[1] * 1000) / 10 + '%'
            : '0%',
          color: '',
        },
        coralL2AutoAccData: coralL2AutoAccuracy(data),
        coralL2AutoAcc: {
          data: !isNaN(+coralL2AutoAccuracy(data)[1])
            ? Math.round(+coralL2AutoAccuracy(data)[1] * 1000) / 10 + '%'
            : '0%',
          color: '',
        },
        coralL3AutoAccData: coralL3AutoAccuracy(data),
        coralL3AutoAcc: {
          data: !isNaN(+coralL3AutoAccuracy(data)[1])
            ? Math.round(+coralL3AutoAccuracy(data)[1] * 1000) / 10 + '%'
            : '0%',
          color: '',
        },
        coralL4AutoAccData: coralL4AutoAccuracy(data),
        coralL4AutoAcc: {
          data: !isNaN(+coralL4AutoAccuracy(data)[1])
            ? Math.round(+coralL4AutoAccuracy(data)[1] * 1000) / 10 + '%'
            : '0%',
          color: '',
        },
        autoAccData: autoAccuracy(data),
        autoAcc: {
          data: !isNaN(+autoAccuracy(data)[1])
            ? Math.round(+autoAccuracy(data)[1] * 1000) / 10 + '%'
            : '0%',
          color: '',
        },
        teleProcessor: {
          data: Math.round(getAverageProcessorCycles(data) * 100) / 100,
          color: '',
        },
        teleNet: {
          data: Math.round(getAverageNetCycles(data) * 100) / 100,
          color: '',
        },
        teleCoralL1: {
          data: Math.round(getAverageCoralL1Cycles(data) * 100) / 100,
          color: '',
        },
        teleCoralL2: {
          data: Math.round(getAverageCoralL2Cycles(data) * 100) / 100,
          color: '',
        },
        teleCoralL3: {
          data: Math.round(getAverageCoralL3Cycles(data) * 100) / 100,
          color: '',
        },
        teleCoralL4: {
          data: Math.round(getAverageCoralL4Cycles(data) * 100) / 100,
          color: '',
        },
        teleReef: {
          data: Math.round(getAverageReefCycles(data) * 100) / 100,
          color: '',
        },
        teleAccData: teleAccuracy(data),
        teleAcc: {
          data: !isNaN(+teleAccuracy(data)[1])
            ? Math.round(+teleAccuracy(data)[1] * 1000) / 10 + '%'
            : '0%',
          color: '',
        },
        endgamePoints: {
          data: Math.round(endgamePoints(data) * 100) / 100,
          color: '',
        },
        endgameChart: { data: compileEndgames(data), color: '' },
        class: alliance,
        rawData: data,
        extraNotes: teamExtraNotes,
      };
      teamsData.value.push(arr);
    }
  }

  //Defaults to the alliance colors being together if match filter is selected
  if (redAlliance.length > 0 || blueAlliance.length > 0) {
    let sortedData = [];
    for (let team of teamsData.value) {
      if (team.class == 'bg-blue-100') sortedData.unshift(team);
      else sortedData.push(team);
    }
    teamsData.value = sortedData;
  }
  /*// averages if i ever need
  let averages = {
    driver: 0,
    defense: 0,
    netAuto: 0,
    netAutoAcc: 0,
    processorAuto: 0,
    processorAutoAcc: 0,
    coralL1Auto: 0,
    coralL2Auto: 0,
    coralL3Auto: 0,
    coralL4Auto: 0,
    autoAcc: 0,
    teleProcessor: 0,
    teleNet: 0,
    teleCoralL1: 0,
    teleCoralL2: 0,
    teleCoralL3: 0,
    teleCoralL4: 0,
    teleAcc: 0,
    endgamePoints: 0,

  }
  let weight = 0
  for (let team of teamsData.value) {
    let totalMatches = team.rawData.length
    averages.driver += team.driver.data * totalMatches
    averages.defense += team.defense.data * totalMatches
    averages.netAuto += team.netAuto.data * totalMatches
    averages.processorAuto += team.processorAuto.data * totalMatches
    averages.coralL1Auto += team.coralL1Auto.data * totalMatches
    averages.coralL2Auto += team.coralL2Auto.data * totalMatches
    averages.coralL3Auto += team.coralL3Auto.data * totalMatches
    averages.coralL4Auto += team.coralL4Auto.data * totalMatches
    averages.autoAcc += Number(team.autoAcc.data.replace('%', '')) * totalMatches
    averages.teleProcessor += team.teleProcessor.data * totalMatches
    averages.teleNet += team.teleNet.data * totalMatches
    averages.teleCoralL1 += team.teleCoralL1 * totalMatches
    averages.teleCoralL2 += team.teleCoralL2 * totalMatches
    averages.teleCoralL3 += team.teleCoralL3 * totalMatches
    averages.teleCoralL4 += team.teleCoralL4 * totalMatches
    averages.teleAcc += Number(team.teleAcc.data.replace('%', '')) * totalMatches
    averages.endgamePoints += team.endgamePoints.data * totalMatches
    weight += totalMatches
  }
  averages.driver /= weight
  averages.defense /= weight
  averages.netAuto /= weight
  averages.processorAuto /= weight
  averages.coralL1Auto /= weight
  averages.coralL2Auto /= weight
  averages.coralL3Auto /= weight
  averages.coralL4Auto /= weight
  averages.autoAcc /= weight
  averages.teleProcessor /= weight
  averages.teleNet /= weight
  averages.teleCoralL1 /= weight
  averages.teleCoralL2 /= weight
  averages.teleCoralL3 /= weight
  averages.teleCoralL4 /= weight
  averages.teleAcc /= weight
  averages.endgamePoints /= weight
*/

  let data: {
    driver: number[];
    defense: number[];
    netAuto: number[];
    netAutoAcc: number[];
    processorAuto: number[];
    processorAutoAcc: number[];
    coralL1Auto: number[];
    coralL2Auto: number[];
    coralL3Auto: number[];
    coralL4Auto: number[];
    reefAuto: number[];
    reefAutoAcc: number[];
    coralL1AutoAcc: number[];
    coralL2AutoAcc: number[];
    coralL3AutoAcc: number[];
    coralL4AutoAcc: number[];
    autoAcc: number[];
    teleProcessor: number[];
    teleNet: number[];
    teleCoralL1: number[];
    teleCoralL2: number[];
    teleCoralL3: number[];
    teleCoralL4: number[];
    teleReef: number[];
    teleAcc: number[];
    endgamePoints: number[];
  } = {
    driver: [],
    defense: [],
    netAuto: [],
    netAutoAcc: [],
    processorAuto: [],
    processorAutoAcc: [],
    coralL1Auto: [],
    coralL2Auto: [],
    coralL3Auto: [],
    coralL4Auto: [],
    reefAuto: [],
    reefAutoAcc: [],
    coralL1AutoAcc: [],
    coralL2AutoAcc: [],
    coralL3AutoAcc: [],
    coralL4AutoAcc: [],
    autoAcc: [],
    teleProcessor: [],
    teleNet: [],
    teleCoralL1: [],
    teleCoralL2: [],
    teleCoralL3: [],
    teleCoralL4: [],
    teleReef: [],
    teleAcc: [],
    endgamePoints: [],
  };
  for (let team of teamsData.value) {
    if (team.driver.data != 0) data.driver.push(Number(team.driver.data));
    else if (!data.driver.includes(0)) data.driver.push(0);

    if (team.defense.data != 0) data.defense.push(Number(team.defense.data));
    else if (!data.defense.includes(0)) data.defense.push(0);
    data.netAuto.push(Number(team.netAuto.data));
    data.netAutoAcc.push(Number(team.netAutoAcc.data.replace('%', '')));
    data.processorAuto.push(Number(team.processorAuto.data));
    data.processorAutoAcc.push(Number(team.processorAutoAcc.data.replace('%', '')));
    data.coralL1Auto.push(Number(team.coralL1Auto.data));
    data.coralL2Auto.push(Number(team.coralL2Auto.data));
    data.coralL3Auto.push(Number(team.coralL3Auto.data));
    data.coralL4Auto.push(Number(team.coralL4Auto.data));
    data.reefAuto.push(Number(team.reefAuto.data));
    data.coralL1AutoAcc.push(Number(team.coralL1AutoAcc.data.replace('%', '')));
    data.coralL2AutoAcc.push(Number(team.coralL2AutoAcc.data.replace('%', '')));
    data.coralL3AutoAcc.push(Number(team.coralL3AutoAcc.data.replace('%', '')));
    data.coralL4AutoAcc.push(Number(team.coralL4AutoAcc.data.replace('%', '')));
    data.autoAcc.push(Number(team.autoAcc.data.replace('%', '')));
    data.teleProcessor.push(Number(team.teleProcessor.data));
    data.teleNet.push(Number(team.teleNet.data));
    data.teleCoralL1.push(Number(team.teleCoralL1.data));
    data.teleCoralL2.push(Number(team.teleCoralL2.data));
    data.teleCoralL3.push(Number(team.teleCoralL3.data));
    data.teleCoralL4.push(Number(team.teleCoralL4.data));
    data.teleReef.push(Number(team.teleReef.data));
    data.teleAcc.push(Number(team.teleAcc.data.replace('%', '')));
    data.endgamePoints.push(Number(team.endgamePoints.data));
  }
  let teamPercents = [];
  for (let i = 0; i < teamsData.value.length; i++) {
    teamPercents.push(colorifyTeam(teamsData.value[i], data));
  }
  let sortedTeamPercents = [...teamPercents];
  sortedTeamPercents.sort((a, b) => a - b);
  for (let i = 0; i < teamsData.value.length; i++) {
    teamsData.value[i].team.color = colorify(
      ((sortedTeamPercents.indexOf(teamPercents[i]) + 1) /
        sortedTeamPercents.length) *
        100,
    );
    teamsData.value[i].driver.color = colorify(
      calculatePercent(
        teamsData.value[i].driver.data,
        Math.min(...data.driver),
        Math.max(...data.driver),
      ),
    );
    teamsData.value[i].defense.color = colorify(
      calculatePercent(
        teamsData.value[i].defense.data,
        Math.min(...data.defense),
        Math.max(...data.defense),
      ),
    );
    teamsData.value[i].netAuto.color = colorify(
      calculatePercent(
        teamsData.value[i].netAuto.data,
        Math.min(...data.netAuto),
        Math.max(...data.netAuto),
      ),
    );
    teamsData.value[i].processorAuto.color = colorify(
      calculatePercent(
        teamsData.value[i].processorAuto.data,
        Math.min(...data.processorAuto),
        Math.max(...data.processorAuto),
      ),
    );
    teamsData.value[i].coralL1Auto.color = colorify(
      calculatePercent(
        teamsData.value[i].coralL1Auto.data,
        Math.min(...data.coralL1Auto),
        Math.max(...data.coralL1Auto),
      ),
    );
    teamsData.value[i].coralL2Auto.color = colorify(
      calculatePercent(
        teamsData.value[i].coralL2Auto.data,
        Math.min(...data.coralL2Auto),
        Math.max(...data.coralL2Auto),
      ),
    );
    teamsData.value[i].coralL3Auto.color = colorify(
      calculatePercent(
        teamsData.value[i].coralL3Auto.data,
        Math.min(...data.coralL3Auto),
        Math.max(...data.coralL3Auto),
      ),
    );
    teamsData.value[i].coralL4Auto.color = colorify(
      calculatePercent(
        teamsData.value[i].coralL4Auto.data,
        Math.min(...data.coralL4Auto),
        Math.max(...data.coralL4Auto),
      ),
    );
    teamsData.value[i].reefAuto.color = colorify(
      calculatePercent(
        teamsData.value[i].reefAuto.data,
        Math.min(...data.reefAuto),
        Math.max(...data.reefAuto),
      ),
    );
    teamsData.value[i].autoAcc.color = colorify(
      calculatePercent(
        teamsData.value[i].autoAcc.data.replace('%', ''),
        Math.min(...data.autoAcc),
        Math.max(...data.autoAcc),
      ),
    );
    teamsData.value[i].teleProcessor.color = colorify(
      calculatePercent(
        teamsData.value[i].teleProcessor.data,
        Math.min(...data.teleProcessor),
        Math.max(...data.teleProcessor),
      ),
    );
    teamsData.value[i].teleNet.color = colorify(
      calculatePercent(
        teamsData.value[i].teleNet.data,
        Math.min(...data.teleNet),
        Math.max(...data.teleNet),
      ),
    );
    teamsData.value[i].teleCoralL1.color = colorify(
      calculatePercent(
        teamsData.value[i].teleCoralL1.data,
        Math.min(...data.teleCoralL1),
        Math.max(...data.teleCoralL1),
      ),
    );
    teamsData.value[i].teleCoralL2.color = colorify(
      calculatePercent(
        teamsData.value[i].teleCoralL2.data,
        Math.min(...data.teleCoralL3),
        Math.max(...data.teleCoralL3),
      ),
    );
    teamsData.value[i].teleCoralL3.color = colorify(
      calculatePercent(
        teamsData.value[i].teleCoralL3.data,
        Math.min(...data.teleCoralL3),
        Math.max(...data.teleCoralL3),
      ),
    );
    teamsData.value[i].teleCoralL4.color = colorify(
      calculatePercent(
        teamsData.value[i].teleCoralL4.data,
        Math.min(...data.teleCoralL4),
        Math.max(...data.teleCoralL4),
      ),
    );
    teamsData.value[i].teleReef.color = colorify(
      calculatePercent(
        teamsData.value[i].teleReef.data,
        Math.min(...data.teleReef),
        Math.max(...data.teleReef),
      ),
    );
    teamsData.value[i].teleAcc.color = colorify(
      calculatePercent(
        teamsData.value[i].teleAcc.data.replace('%', ''),
        Math.min(...data.teleAcc),
        Math.max(...data.teleAcc),
      ),
    );
    teamsData.value[i].endgamePoints.color = colorify(
      calculatePercent(
        teamsData.value[i].endgamePoints.data,
        Math.min(...data.endgamePoints),
        Math.max(...data.endgamePoints),
      ),
    );
  }
  teamsData.value.sort(
    (a: TeamTableData, b: TeamTableData) =>
      Number(a.team.data) - Number(b.team.data),
  );
}

//TODO: talk to ryan or preston about math here
function colorifyTeam(teamData: TeamTableData, data: DataArrayOrSum) {
  let totalPercent = 0;
  if (teamData.driver.data != 0) {
    totalPercent += calculatePercent(
      teamData.driver.data,
      Math.min(...data.driver),
      Math.max(...data.driver),
    ) ;
  } else {
    totalPercent +=
      calculatePercent(
        average(data.driver),
        Math.min(...data.driver),
        Math.max(...data.driver),
      );
  }
  if (teamData.defense.data != 0) {
    totalPercent +=
      calculatePercent(
        teamData.defense.data,
        Math.min(...data.defense),
        Math.max(...data.defense),
      );
  } else {
    totalPercent +=
      calculatePercent(
        average(data.defense),
        Math.min(...data.defense),
        Math.max(...data.defense),
      );
  }
  totalPercent += calculatePercent(
    teamData.netAuto.data,
    Math.min(...data.netAuto),
    Math.max(...data.netAuto),
  );
  totalPercent += calculatePercent(
    teamData.processorAuto.data,
    Math.min(...data.processorAuto),
    Math.max(...data.processorAuto),
  );
  totalPercent += calculatePercent(
    teamData.coralL1Auto.data,
    Math.min(...data.coralL1Auto),
    Math.max(...data.coralL1Auto),
  );
  totalPercent += calculatePercent(
    teamData.coralL2Auto.data,
    Math.min(...data.coralL2Auto),
    Math.max(...data.coralL2Auto),
  );
  totalPercent += calculatePercent(
    teamData.coralL3Auto.data,
    Math.min(...data.coralL3Auto),
    Math.max(...data.coralL3Auto),
  );
  totalPercent += calculatePercent(
    teamData.coralL4Auto.data,
    Math.min(...data.coralL4Auto),
    Math.max(...data.coralL4Auto),
  );
  totalPercent += calculatePercent(
    Number(teamData.autoAcc.data.replace('%', '')),
    Math.min(...data.autoAcc),
    Math.max(...data.autoAcc),
    );
  totalPercent +=
    calculatePercent(
      teamData.teleProcessor.data,
      Math.min(...data.teleProcessor),
      Math.max(...data.teleProcessor),
    );
  totalPercent += calculatePercent(
    teamData.teleNet.data,
    Math.min(...data.teleNet),
    Math.max(...data.teleNet),
  );
  totalPercent += calculatePercent(
    teamData.teleCoralL1.data,
    Math.min(...data.teleCoralL1),
    Math.max(...data.teleCoralL1),
  );
  totalPercent += calculatePercent(
    teamData.teleCoralL2.data,
    Math.min(...data.teleCoralL2),
    Math.max(...data.teleCoralL2),
  );
  totalPercent += calculatePercent(
    teamData.teleCoralL3.data,
    Math.min(...data.teleCoralL3),
    Math.max(...data.teleCoralL3),
  );
  totalPercent += calculatePercent(
    teamData.teleCoralL4.data,
    Math.min(...data.teleCoralL4),
    Math.max(...data.teleCoralL4),
  );
  totalPercent +=
    calculatePercent(
      Number(teamData.teleAcc.data.replace('%', '')),
      Math.min(...data.teleAcc),
      Math.max(...data.teleAcc),
    );
  totalPercent += calculatePercent(
    teamData.endgamePoints.data,
    Math.min(...data.endgamePoints),
    Math.max(...data.endgamePoints),
  );
  return totalPercent;
}

function calculatePercent(score: number, min: number, max: number) {
  if (max === min) {
    return 0;
  }
  return ((score - min) / (max - min)) * 100;
}

function colorify(percentage: number) {
  if (percentage >= 90) return 'blue';
  else if (percentage >= 66) return 'green';
  else if (percentage >= 33) return 'gray';
  else return 'coral';
}

function averageDefensiveScore(teamArrays: Array<ScoutingData>) {
  let total = 0;
  let totalMatches = 0;
  for (let match of teamArrays) {
    //Try catch needed due to old version of data
    try {
      if (match.notes.promptedNotes[0].selected) {
        total += match.notes.promptedNotes[0].rating;
        totalMatches++;
      }
    } catch {}
  }
  return totalMatches != 0 ? total / totalMatches : 0;
}

function averageDriverScore(teamArrays: Array<ScoutingData>) {
  let total = 0;
  let totalMatches = 0;
  for (let match of teamArrays) {
    //Try catch needed due to old version of data
    try {
      if (match.notes.promptedNotes[2].selected) {
        total += match.notes.promptedNotes[2].rating;
        totalMatches++;
      }
    } catch {}
  }
  return totalMatches != 0 ? total / totalMatches : 0;
}

function averageNetAuto(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0;
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].auto.net;
  }
  return nonAveragedValue / teamArrays.length;
}

function averageProcessorAuto(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0;
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].auto.processor;
  }
  return nonAveragedValue / teamArrays.length;
}

function averageCoralL1Auto(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0;
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].auto.coralL1;
  }
  return nonAveragedValue / teamArrays.length;
}

function averageCoralL2Auto(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0;
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].auto.coralL2;
  }
  return nonAveragedValue / teamArrays.length;
}

function averageCoralL3Auto(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0;
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].auto.coralL3;
  }
  return nonAveragedValue / teamArrays.length;
}

function averageCoralL4Auto(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0;
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].auto.coralL4;
  }
  return nonAveragedValue / teamArrays.length;
}
function averageReefAuto(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0;
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].auto.coralL1 + teamArrays[i].auto.coralL2 + teamArrays[i].auto.coralL3 + teamArrays[i].auto.coralL4;
  }
  return nonAveragedValue / teamArrays.length;
}

function getAverageNetCycles(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0;
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].teleop.net;
  }
  return nonAveragedValue / teamArrays.length;
}

function getAverageProcessorCycles(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0;
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].teleop.processor;
  }
  return nonAveragedValue / teamArrays.length;
}

function getAverageCoralL1Cycles(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0;
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].teleop.coralL1;
  }
  return nonAveragedValue / teamArrays.length;
}

function getAverageCoralL2Cycles(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0;
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].teleop.coralL2;
  }
  return nonAveragedValue / teamArrays.length;
}

function getAverageCoralL3Cycles(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0;
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].teleop.coralL3;
  }
  return nonAveragedValue / teamArrays.length;
}

function getAverageCoralL4Cycles(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0;
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].teleop.coralL4;
  }
  return nonAveragedValue / teamArrays.length;
}

function getAverageReefCycles(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0;
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].teleop.coralL1 + teamArrays[i].teleop.coralL2 + teamArrays[i].teleop.coralL3 + teamArrays[i].teleop.coralL4;
  }
  return nonAveragedValue / teamArrays.length;
}

function averageAuto(teamArrays: Array<ScoutingData>): number {
  let successfulMobilityCount = 0;
  for (let match of teamArrays) {
    successfulMobilityCount += match.auto.mobility ? 1 : 0;
  }
  return successfulMobilityCount / teamArrays.length;
}

function netAutoAccuracy(teamArrays: Array<ScoutingData>) {
  let successfulNetCount = 0;
  let missedNetCount = 0;
  let newData = false;
  for (let match of teamArrays) {
    successfulNetCount += match.auto.net;
    if (match.auto.netMiss != undefined) {
      missedNetCount += match.auto.netMiss;
      newData = true;
    } else {
      missedNetCount += match.auto.netMiss;
    }
  }
  if (newData)
    return [
      true,
      (successfulNetCount) /
      (missedNetCount + successfulNetCount),
    ];
  else
    return [
      false,
      (successfulNetCount) /
      (successfulNetCount),
    ];
}

function processorAutoAccuracy(teamArrays: Array<ScoutingData>) {
  let successfulProcessorCount = 0;
  let missedProcessorCount = 0;
  let newData = false;
  for (let match of teamArrays) {
    successfulProcessorCount += match.auto.processor;
    if (match.auto.processorMiss != undefined) {
      missedProcessorCount += match.auto.processorMiss;
      newData = true;
    }
    else {
      missedProcessorCount += match.auto.processorMiss;
    }
  }
  if (newData)
    return [
      true,
      (successfulProcessorCount) /
      (missedProcessorCount + successfulProcessorCount),
    ];
  else
    return [
      false,
      (successfulProcessorCount) /
      (successfulProcessorCount),
    ];
}

function coralL1AutoAccuracy(teamArrays: Array<ScoutingData>) {
  let successfulCoralCount = 0;
  let missedCoralCount = 0;
  let newData = false;
  for (let match of teamArrays) {
    successfulCoralCount += match.auto.coralL1;
    if (match.auto.coralL1Miss != undefined) {
      missedCoralCount += match.auto.coralL1Miss;
      newData = true;
    }
    else {
      missedCoralCount += match.auto.coralL1Miss;
    }
  }
  if (newData)
    return [
      true,
      (successfulCoralCount) /
      (missedCoralCount + successfulCoralCount),
    ];
  else
    return [
      false,
      (successfulCoralCount) /
      (successfulCoralCount),
    ];
}

function coralL2AutoAccuracy(teamArrays: Array<ScoutingData>) {
  let successfulCoralCount = 0;
  let missedCoralCount = 0;
  let newData = false;
  for (let match of teamArrays) {
    successfulCoralCount += match.auto.coralL2;
    if (match.auto.coralL2Miss != undefined) {
      missedCoralCount += match.auto.coralL2Miss;
      newData = true;
    }
    else {
      missedCoralCount += match.auto.coralL2Miss;
    }
  }
  if (newData)
    return [
      true,
      (successfulCoralCount) /
      (missedCoralCount + successfulCoralCount),
    ];
  else
    return [
      false,
      (successfulCoralCount) /
      (successfulCoralCount),
    ];
}

function coralL3AutoAccuracy(teamArrays: Array<ScoutingData>) {
  let successfulCoralCount = 0;
  let missedCoralCount = 0;
  let newData = false;
  for (let match of teamArrays) {
    successfulCoralCount += match.auto.coralL3;
    if (match.auto.coralL3Miss != undefined) {
      missedCoralCount += match.auto.coralL3Miss;
      newData = true;
    }
    else {
      missedCoralCount += match.auto.coralL3Miss;
    }
  }
  if (newData)
    return [
      true,
      (successfulCoralCount) /
      (missedCoralCount + successfulCoralCount),
    ];
  else
    return [
      false,
      (successfulCoralCount) /
      (successfulCoralCount),
    ];
}

function reefAutoAccuracy(teamArrays: Array<ScoutingData>) {
  let successfulCoralCount = 0;
  let missedCoralCount = 0;
  let newData = false;
  for (let match of teamArrays) {
    successfulCoralCount += (match.auto.coralL1 + match.auto.coralL2 + match.auto.coralL3 + match.auto.coralL4);
    if ((match.auto.coralL1Miss + match.auto.coralL2Miss + match.auto.coralL3Miss + match.auto.coralL4Miss) != undefined) {
      missedCoralCount += (match.auto.coralL1Miss + match.auto.coralL2Miss + match.auto.coralL3Miss + match.auto.coralL4Miss);
      newData = true;
    }
    else {
      missedCoralCount += (match.auto.coralL1Miss + match.auto.coralL2Miss + match.auto.coralL3Miss + match.auto.coralL4Miss);
    }
  }
  if (newData)
    return [
      true,
      (successfulCoralCount) /
      (missedCoralCount + successfulCoralCount),
    ];
  else
    return [
      false,
      (successfulCoralCount) /
      (successfulCoralCount),
    ];
}

function coralL4AutoAccuracy(teamArrays: Array<ScoutingData>) {
  let successfulCoralCount = 0;
  let missedCoralCount = 0;
  let newData = false;
  for (let match of teamArrays) {
    successfulCoralCount += match.auto.coralL4;
    if (match.auto.coralL4Miss != undefined) {
      missedCoralCount += match.auto.coralL4Miss;
      newData = true;
    }
    else {
      missedCoralCount += match.auto.coralL4Miss;
    }
  }
  if (newData)
    return [
      true,
      (successfulCoralCount) /
      (missedCoralCount + successfulCoralCount),
    ];
  else
    return [
      false,
      (successfulCoralCount) /
      (successfulCoralCount),
    ];
}

function autoAccuracy(teamArrays: Array<ScoutingData>) {
  let successfulNetCount = 0;
  let successfulProcessorCount = 0;
  let successfulCoralL1Count = 0;
  let successfulCoralL2Count = 0;
  let successfulCoralL3Count = 0;
  let successfulCoralL4Count = 0;
  let successfulReefCount = 0;
  let missedNetCount = 0;
  let missedProcessorCount = 0;
  let missedCoralL1Count = 0;
  let missedCoralL2Count = 0;
  let missedCoralL3Count = 0;
  let missedCoralL4Count = 0;
  let missedReefCount = 0;
  let newData = false;
  for (let match of teamArrays) {
    successfulNetCount += match.auto.net;
    successfulProcessorCount += match.auto.processor;
    successfulCoralL1Count += match.auto.coralL1;
    successfulCoralL2Count += match.auto.coralL2;
    successfulCoralL3Count += match.auto.coralL3;
    successfulCoralL4Count += match.auto.coralL4;
    successfulReefCount += match.auto.coralL1 + match.auto.coralL2 + match.auto.coralL3 + match.auto.coralL4;
    if (match.auto.netMiss != undefined) {
      missedNetCount += match.auto.netMiss;
      missedProcessorCount += match.auto.processorMiss;
      missedCoralL1Count += match.auto.coralL1Miss;
      missedCoralL2Count += match.auto.coralL2Miss;
      missedCoralL3Count += match.auto.coralL3Miss;
      missedCoralL4Count += match.auto.coralL4Miss;
      missedReefCount += match.auto.coralL1Miss + match.auto.coralL2Miss + match.auto.coralL3Miss + match.auto.coralL4Miss;
      //TODO: talk about adding coral misses to scouting and then put them here
      newData = true;
    } else {
      missedNetCount += match.auto.netMiss;
    }
  }
  //TODO: reef accuracy here
  if (newData)
    return [
      true,
      (successfulNetCount + successfulProcessorCount + successfulReefCount) /
        (missedNetCount + missedProcessorCount + successfulProcessorCount + successfulNetCount + successfulReefCount + missedReefCount),
      successfulNetCount / (missedNetCount + successfulNetCount),
      successfulProcessorCount / (missedProcessorCount + successfulProcessorCount),
      successfulReefCount / (missedReefCount + successfulReefCount),
    ];
  else
    return [
      false,
      (successfulNetCount + successfulReefCount + successfulProcessorCount) /
        (missedProcessorCount + successfulProcessorCount + successfulNetCount + missedReefCount + successfulReefCount),
    ];
}

function teleAccuracy(teamArrays: Array<ScoutingData>) {
  let successfulNetCount = 0;
  let successfulProcessorCount = 0;
  let successfulCoralL1Count = 0;
  let successfulCoralL2Count = 0;
  let successfulCoralL3Count = 0;
  let successfulCoralL4Count = 0;
  let successfulReefCount = 0;
  let missedNetCount = 0;
  let missedProcessorCount = 0;
  let missedCoralL1Count = 0;
  let missedCoralL2Count = 0;
  let missedCoralL3Count = 0;
  let missedCoralL4Count = 0;
  let missedReefCount = 0;
  let newData = false;
  for (let match of teamArrays) {
    successfulNetCount += match.teleop.net;
    successfulProcessorCount += match.teleop.processor;
    successfulCoralL1Count += match.teleop.coralL1;
    successfulCoralL2Count += match.teleop.coralL2;
    successfulCoralL3Count += match.teleop.coralL3;
    successfulCoralL4Count += match.teleop.coralL4;
    successfulReefCount += match.teleop.coralL1 + match.teleop.coralL2 + match.teleop.coralL3 + match.teleop.coralL4;
    if (match.teleop.processorMiss != undefined) {
      //TODO: talk about adding coral misses to scouting and then put them here
      missedNetCount += match.teleop.netMiss;
      missedProcessorCount += match.teleop.processorMiss;
      missedCoralL1Count += match.teleop.coralL1Miss;
      missedCoralL2Count += match.teleop.coralL2Miss;
      missedCoralL3Count += match.teleop.coralL3Miss;
      missedCoralL4Count += match.teleop.coralL4Miss;
      missedReefCount += match.teleop.coralL1Miss + match.teleop.coralL2Miss + match.teleop.coralL3Miss + match.teleop.coralL4Miss;

      newData = true;
    } else {
      missedProcessorCount += match.teleop.processorMiss;
    }
  }
  //TODO: reef accuracy here
  if (newData)
    return [
      true,
      (successfulNetCount + successfulProcessorCount + successfulReefCount) /
      (missedNetCount + missedProcessorCount + successfulProcessorCount + successfulNetCount + successfulReefCount + missedReefCount),
      successfulNetCount / (missedNetCount + successfulNetCount),
      successfulProcessorCount / (missedProcessorCount + successfulProcessorCount),
      successfulReefCount / (missedReefCount + successfulReefCount),
    ];
  else
    return [
      false,
      (successfulNetCount + successfulReefCount + successfulProcessorCount) /
      (missedProcessorCount + successfulProcessorCount + successfulNetCount + successfulReefCount + missedReefCount),
    ];
}
function endgamePoints(teamArrays: Array<ScoutingData>): number {
  let totalEndgamePoints = 0;
  for (let event of teamArrays) {
    if (event.endgame.endgame.includes('Deep Successful')) totalEndgamePoints += 12;
    else if (event.endgame.endgame.includes('Shallow Successful')) totalEndgamePoints += 6;
    else if (
      event.endgame.endgame.includes('Deep Attempted') ||
      event.endgame.endgame.includes('Parked') || event.endgame.endgame.includes('Shallow Attempted')
    )
      totalEndgamePoints += 2;
  }
  return totalEndgamePoints / teamArrays.length;
}

function compileEndgames(
  teamArrays: Array<ScoutingData>,
): [Array<string>, Array<number>] {
  let endgameMap = new Map<string, number>();
  for (let i = 0; i < teamArrays.length; i++) {
    teamArrays[i].endgame.endgame.forEach(function (value: string) {
      if (endgameMap.has(value)) {
        endgameMap.set(value, endgameMap.get(value)! + 1);
      } else endgameMap.set(value, 1);
    });
  }
  let endgameOptionsArr: Array<string> = [];
  let endgameDataArr: Array<number> = [];
  endgameMap.forEach(function (value, key) {
    endgameOptionsArr.push(key);
    endgameDataArr.push(value);
  });
  return [endgameOptionsArr, endgameDataArr];
}

let columns = ref([
  {
    label: 'Team',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Photos',
    sort: 'none',
    sortable: false,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Driver',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Defense',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Net',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Processor',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Reef',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  /*{
    label: 'Coral L1',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Coral L2',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Coral L3',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Coral L4',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },*/
  {
    label: 'Accuracy',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Net',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Processor',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Reef',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Accuracy',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Points',
    sort: 'none',
    sortable: true,
    icon: 'i-heroicons-arrows-up-down',
  },
  {
    label: 'Chart',
    sort: 'none',
    sortable: false,
    icon: 'i-heroicons-arrows-up-down',
  },
]);

function sortTable(n: number, sort: string, col: string) {
  let table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById('teamTable') as HTMLTableElement | null;
  // returning if nothing in the table
  if (!table) return;
  switching = true;
  // Set the sorting direction to ascending:
  if (sort == 'none') sort = 'desc';
  else if (sort == 'desc') sort = 'asc';
  else if (sort == 'asc') sort = 'none';
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */

    for (i = 1; i < rows.length - 1; i++) {
      // Reset shouldSwitch for each iteration
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      if (sort == 'none' || col == 'Team') {
        x = rows[i].getElementsByTagName('TD')[0];
        y = rows[i + 1].getElementsByTagName('TD')[0];
      } else if (sort == 'desc' || sort == 'asc') {
        x = rows[i].getElementsByTagName('TD')[n];
        y = rows[i + 1].getElementsByTagName('TD')[n];
      }
      if (x && y) {
        if (sort == 'none') {
          let xInnerHTML = x.innerHTML;
          let yInnerHTML = y.innerHTML;
          const regex = /<span[^>]*>(.*?)<\/span>/;
          const xMatch = xInnerHTML.match(regex);
          const yMatch = yInnerHTML.match(regex);
          const xInnerText = xMatch ? xMatch[1] : '';
          const yInnerText = yMatch ? yMatch[1] : '';
          if (makeSortable(xInnerText) > makeSortable(yInnerText)) {
            shouldSwitch = true;
            break;
          }
        }
        if (col == 'Team') {
          let colorX = x.innerHTML
            .substring(x.innerHTML.search('bg-'))
            .split('-')[1];
          let colorY = y.innerHTML
            .substring(y.innerHTML.search('bg-'))
            .split('-')[1];
          let possibleColors = ['coral', 'gray', 'green', 'blue'];
          if (sort == 'desc') {
            if (
              possibleColors.indexOf(colorX) < possibleColors.indexOf(colorY)
            ) {
              shouldSwitch = true;
              break;
            }
          } else if (sort == 'asc') {
            if (
              possibleColors.indexOf(colorX) > possibleColors.indexOf(colorY)
            ) {
              shouldSwitch = true;
              break;
            }
          }
        } else if (sort == 'desc') {
          let xInnerHTML = x.innerHTML;
          let yInnerHTML = y.innerHTML;
          let xInnerText, yInnerText;
          if (col != 'Accuracy') {
            xInnerText = xInnerHTML.substring(
              xInnerHTML.indexOf('>') + 1,
              xInnerHTML.lastIndexOf('<'),
            );
            yInnerText = yInnerHTML.substring(
              yInnerHTML.indexOf('>') + 1,
              yInnerHTML.lastIndexOf('<'),
            );
            if (xInnerText == 'N/A') xInnerText = '0';
            if (yInnerText == 'N/A') yInnerText = '0';
          } else {
            const regex = /<span[^>]*>(.*?)<\/span>/;
            const xMatch = xInnerHTML.match(regex);
            const yMatch = yInnerHTML.match(regex);
            xInnerText = xMatch ? xMatch[1] : '';
            yInnerText = yMatch ? yMatch[1] : '';
          }
          if (makeSortable(xInnerText) < makeSortable(yInnerText)) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (sort == 'asc') {
          let xInnerHTML = x.innerHTML;
          let yInnerHTML = y.innerHTML;
          let xInnerText, yInnerText;
          if (col != 'Reef') {
            xInnerText = xInnerHTML.substring(
              xInnerHTML.indexOf('>') + 1,
              xInnerHTML.lastIndexOf('<'),
            );
            yInnerText = yInnerHTML.substring(
              yInnerHTML.indexOf('>') + 1,
              yInnerHTML.lastIndexOf('<'),
            );
            if (xInnerText == 'N/A') xInnerText = '0';
            if (yInnerText == 'N/A') yInnerText = '0';
          } else {
            const regex = /<span[^>]*>(.*?)<\/span>/;
            const xMatch = xInnerHTML.match(regex);
            const yMatch = yInnerHTML.match(regex);
            xInnerText = xMatch ? xMatch[1] : '';
            yInnerText = yMatch ? yMatch[1] : '';
          }
          if (makeSortable(xInnerText) > makeSortable(yInnerText)) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode?.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
  if (sort == 'desc') {
    for (let i = 0; i < columns.value.length; i++) {
      columns.value[i].sort = 'none';
      columns.value[i].icon = 'i-heroicons-arrows-up-down';
    }
    columns.value[n].sort = 'desc';
    columns.value[n].icon = 'i-heroicons-bars-arrow-down';
  } else if (sort == 'asc') {
    for (let i = 0; i < columns.value.length; i++) {
      columns.value[i].sort = 'none';
      columns.value[i].icon = 'i-heroicons-arrows-up-down';
    }
    columns.value[n].sort = 'asc';
    columns.value[n].icon = 'i-heroicons-bars-arrow-up';
  } else if (sort == 'none') {
    columns.value[n].sort = 'none';
    columns.value[n].icon = 'i-heroicons-arrows-up-down';
  }
}

function makeSortable(thing: string) {
  if (thing.endsWith('%')) {
    thing = thing.replace('%', '');
    return Number(thing);
  }
  if (!isNaN(+thing)) return Number(thing);
  else return thing;
}

function average(nums: number[]) {
  let total = 0;
  for (let num of nums) {
    total += num;
  }
  if (nums.length != 0) return total / nums.length;
  return 0;
}

await tableSetup();
</script>

<template>
  <OuterComponents>
    <UCard class="max-h-[93ex] ml-12 mr-12 mt-2 overflow-y-scroll dark:bg-gray-800"
      :ui="{
        rounded: '',
      }">
      <template #header>
        <div>
          <UForm>
            <UFormGroup
              class="inline-block mr-2"
              label="Filters"
            >
              <UButtonGroup>
                <USelectMenu
                  class="inline-block min-w-28 w-28 max-w-28"
                  v-model="activeFilterOption"
                  :options="filterOptions"
                />
                <UInput
                  v-model="filterInput"
                  class="inline-block max-w-40"
                  placeholder="filter text..."
                  :ui="{ icon: { trailing: { pointer: '' } } }"
                  v-on:keyup.enter="addFilter"
                >
                  <template #trailing>
                    <UButton
                      v-show="filterInput != ''"
                      color="coral"
                      variant="link"
                      icon="i-heroicons-plus-circle"
                      :padded="false"
                      @click="addFilter"
                    />
                  </template>
                </UInput>
              </UButtonGroup>
            </UFormGroup>
          </UForm>
        </div>
        <UFormGroup>
          <UButton
            v-for="(value, index) in activeFilters"
            :label="value"
            variant="soft"
            class="mt-2 mr-1"
            trailing-icon="i-heroicons-x-mark"
            size="2xs"
            @click="activeFilters.splice(index, 1)"
          />
          <UBadge
            v-if="activeFilters.length == 0"
            variant="soft"
            class="mt-2 rounded-2xl"
            color="gray"
            label="No filters selected"
          />
        </UFormGroup>
        <div class="inline-block m-2">
          <UBadge
            label="Bad: 0%-33%"
            class="rounded-2xl"
            variant="soft"
          />
          <UBadge
            label="Ok: 33%-66%"
            class="rounded-2xl"
            variant="soft"
            color="gray"
          />
          <UBadge
            label="Good: 66%-90%"
            class="rounded-2xl"
            variant="soft"
            color="green"
          />
          <UBadge
            label="Insane: 90%-100%"
            class="rounded-2xl"
            variant="soft"
            color="blue"
          />
        </div>
      </template>
      <template #default>
        <div class="overflow-y-clip overflow-x-scroll">
          <table
            id="teamTable"
            class="table-auto border-x-4 border-t-8 border-gray-50 dark:border-gray-700 mt-2 ml-2 mr-2"
          >
            <colgroup
              span="2"
              class="border-2 odd:bg-gray-50 dark:bg-gray-700 dark:border-gray-400"
            />
            <colgroup
              span="2"
              class="border-2 odd:bg-gray-50 dark:bg-gray-800 dark:border-gray-400"
            />
            <colgroup
              span="4"
              class="border-2 odd:bg-gray-50 dark:bg-gray-700 dark:border-gray-400"
            />
            <colgroup
              span="4"
              class="border-2 odd:bg-gray-50 dark:bg-gray-800 dark:border-gray-400"
            />
            <colgroup
              span="2"
              class="border-2 odd:bg-gray-50 dark:bg-gray-700 dark:border-gray-400"
            />
            <thead class="top-0 sticky bg-gray-50 dark:bg-gray-700 z-10">
              <tr class="border-b-2">
                <th colspan="2" />
                <th colspan="2">
                  <p class="text-xs font-light dark:text-white">Average</p>
                  <p class="dark:text-white">Ratings</p>
                </th>
                <th
                  colspan="4"
                  scope="colgroup"
                >
                  <p class="text-xs font-light dark:text-white">Average</p>
                  <p class="dark:text-white">Cycles</p>
                </th>
                <th
                  colspan="4"
                  scope="colgroup"
                >
                  <p class="text-xs font-light dark:text-white">Average</p>
                  <p class="dark:text-white">Teleop Cycles</p>
                </th>
                <th
                  colspan="2"
                  scope="colgroup"
                >
                  <p class="text-xs font-light dark:text-white">Average</p>
                  <p class="dark:text-white">Endgame</p>
                </th>
              </tr>
              <tr>
                <th
                  scope="col"
                  v-for="(col, index) of columns"
                  class="font-medium text-sm"
                >
                  <UButton
                    v-if="col.sortable"
                    @click="sortTable(index, col.sort, col.label)"
                    :trailing-icon="col.icon"
                    variant="ghost"
                    class="rounded-full dark:bg-gray-700"
                    size="xs"
                    :label="col.label"
                    color="gray"
                  /><UButton
                    v-else
                    :label="col.label"
                    size="xs"
                    variant="ghost"
                    class="rounded-full dark:bg-gray-700"
                    color="gray"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="team of teamsData"
                class="mb-1"
              >
                <td class="text-right">
                  <UButton
                    :label="team.team.data"
                    variant="soft"
                    :color="team.team.color"
                    size="xs"
                    @click="navigateTo('/teams/' + team.team.data)"
                    trailing-icon="i-heroicons-chart-bar-square"
                    class="dark:border-gray-700"
                  />
                </td>
                <td class="text-center">
                  <UButton
                    size="xs"
                    color="gray"
                    icon="i-heroicons-photo"
                    variant="soft"
                    @click="navigateTo('/teams/attachments/' + team.team.data)"
                    class="dark:bg-gray-700"
                  />
                </td>
                <td class="text-center">
                  <UBadge
                    :label="team.driver.data != 0 ? team.driver.data : 'N/A'"
                    variant="soft"
                    :color="team.driver.data != 0 ? team.driver.color : 'gray'"
                  />
                </td>
                <td class="text-center">
                  <UBadge
                    :label="team.defense.data != 0 ? team.defense.data : 'N/A'"
                    variant="soft"
                    :color="
                      team.defense.data != 0 ? team.defense.color : 'gray'
                    "
                  />
                </td>
                <td class="text-center">
                  <UBadge
                    :label="team.netAuto.data"
                    variant="soft"
                    :color="team.netAuto.color"
                  />
                </td>
                <td class="text-center">
                  <UBadge
                    :label="team.processorAuto.data"
                    variant="soft"
                    :color="team.processorAuto.color"
                  />
                </td>
                <td class="text-center">
                  <UPopover
                    v-if="team.reefAuto"
                    mode="hover"
                  >
                    <UButton
                      :label="team.reefAuto.data"
                      variant="soft"
                      :color="team.reefAuto.color"
                      size="xs"
                      class="mx-auto"
                    />
                    <template #panel>
                      <div class="flex">
                        <div>
                          <UBadge
                            label="L1"
                            variant="soft"
                            color="gray"
                          />
                          <UBadge
                            :label="
                              team.coralL1Auto.data
                            "
                            variant="soft"
                            color="white"
                          />
                        </div>
                        <div>
                          <UBadge
                            label="L2"
                            variant="soft"
                            color="gray"
                          />
                          <UBadge
                            :label=" team.coralL2Auto.data
                            "
                            variant="soft"
                            color="white"
                          />
                        </div>
                        <div>
                          <UBadge
                            label="L3"
                            variant="soft"
                            color="gray"
                          />
                          <UBadge
                            :label="
                              team.coralL3Auto.data
                            "
                            variant="soft"
                            color="white"
                          />
                        </div>
                        <div>
                          <UBadge
                            label="L4"
                            variant="soft"
                            color="gray"
                          />
                          <UBadge
                            :label=" team.coralL4Auto.data
                            "
                            variant="soft"
                            color="white"
                          />
                        </div>
                      </div>
                    </template>
                  </UPopover>
                  <UBadge
                    v-else
                    :label="team.reefAuto.data"
                    variant="soft"
                    :color="team.reefAuto.color"
                  />
                </td>
                <td class="text-center">
                  <UPopover
                    v-if="team.autoAccData[0]"
                    mode="hover"
                  >
                    <UButton
                      :label="team.autoAcc.data"
                      variant="soft"
                      :color="team.autoAcc.color"
                      size="xs"
                      class="mx-auto dark:bg-gray-700"
                    />
                    <template #panel>
                      <div class="flex">
                        <div>
                          <UBadge
                            label="Net"
                            variant="soft"
                            color="gray"
                          />
                          <UBadge
                            :label="
                              !isNaN(team.autoAccData[2])
                                ? Math.round(team.autoAccData[2] * 1000) / 10 +
                                  '%'
                                : 'N/A'
                            "
                            variant="soft"
                            color="white"
                          />
                        </div>
                        <div>
                          <UBadge
                            label="Processor"
                            variant="soft"
                            color="gray"
                          />
                          <UBadge
                            :label="
                              !isNaN(team.autoAccData[3])
                                ? Math.round(team.autoAccData[3] * 1000) / 10 +
                                  '%'
                                : 'N/A'
                            "
                            variant="soft"
                            color="white"
                          />
                        </div>
                        <div>
                          <UBadge
                            label="Reef"
                            variant="soft"
                            color="gray"
                          />
                          <UBadge
                            :label="
                              !isNaN(team.autoAccData[4])
                                ? Math.round(team.autoAccData[4] * 1000) / 10 +
                                  '%'
                                : 'N/A'
                            "
                            variant="soft"
                            color="white"
                          />
                        </div>
                      </div>
                    </template>
                  </UPopover>
                  <UBadge
                    v-else
                    :label="team.autoAcc.data"
                    variant="soft"
                    :color="team.autoAcc.color"
                  />
                </td>
                <td class="text-center">
                  <UBadge
                    :label="team.teleNet.data"
                    variant="soft"
                    :color="team.teleNet.color"
                  />
                </td>
                <td class="text-center">
                  <UBadge
                    :label="team.teleProcessor.data"
                    variant="soft"
                    :color="team.teleProcessor.color"
                  />
                </td>

                <td class="text-center">
                  <UPopover
                    v-if="team.teleReef"
                    mode="hover"
                  >
                    <UButton
                      :label="team.teleReef.data"
                      variant="soft"
                      :color="team.teleReef.color"
                      size="xs"
                      class="mx-auto"
                    />
                    <template #panel>
                      <div class="flex">
                        <div>
                          <UBadge
                            label="L1"
                            variant="soft"
                            color="gray"
                          />
                          <UBadge
                            :label="
                              team.teleCoralL1.data
                            "
                            variant="soft"
                            color="white"
                          />
                        </div>
                        <div>
                          <UBadge
                            label="L2"
                            variant="soft"
                            color="gray"
                          />
                          <UBadge
                            :label=" team.teleCoralL2.data
                            "
                            variant="soft"
                            color="white"
                          />
                        </div>
                        <div>
                          <UBadge
                            label="L3"
                            variant="soft"
                            color="gray"
                          />
                          <UBadge
                            :label="
                              team.teleCoralL3.data
                            "
                            variant="soft"
                            color="white"
                          />
                        </div>
                        <div>
                          <UBadge
                            label="L4"
                            variant="soft"
                            color="gray"
                          />
                          <UBadge
                            :label=" team.teleCoralL4.data
                            "
                            variant="soft"
                            color="white"
                          />
                        </div>
                      </div>
                    </template>
                  </UPopover>
                  <UBadge
                    v-else
                    :label="team.teleReef.data"
                    variant="soft"
                    :color="team.teleReef.color"
                  />
                </td>
<!--            <td class="text-center">
                  <UBadge
                    :label="team.teleCoralL1.data"
                    variant="soft"
                    :color="team.teleCoralL1.color"
                  />
                </td>
                <td class="text-center">
                  <UBadge
                    :label="team.teleCoralL2.data"
                    variant="soft"
                    :color="team.teleCoralL2.color"
                  />
                </td>
                <td class="text-center">
                  <UBadge
                    :label="team.teleCoralL3.data"
                    variant="soft"
                    :color="team.teleCoralL3.color"
                  />
                </td>
                <td class="text-center">
                  <UBadge
                    :label="team.teleCoralL4.data"
                    variant="soft"
                    :color="team.teleCoralL4.color"
                  />
                </td>-->
                <td class="text-center">
                  <UPopover
                    v-if="team.teleAccData[0]"
                    mode="hover"
                  >
                    <UButton
                      :label="team.teleAcc.data"
                      variant="soft"
                      :color="team.teleAcc.color"
                      size="xs"
                      class="mx-auto dark:bg-gray-800"
                    />
                    <template #panel>
                      <div class="flex">
                        <div>
                          <UBadge
                            label="Net"
                            variant="soft"
                            color="gray"
                          />
                          <UBadge
                            :label="
                              !isNaN(team.teleAccData[2])
                                ? Math.round(team.teleAccData[2] * 1000) / 10 +
                                  '%'
                                : '0%'
                            "
                            variant="soft"
                            color="white"
                          />
                        </div>
                        <div>
                          <UBadge
                            label="Processor"
                            variant="soft"
                            color="gray"
                          />
                          <UBadge
                            :label="
                              !isNaN(team.teleAccData[3])
                                ? Math.round(team.teleAccData[3] * 1000) / 10 +
                                  '%'
                                : '0%'
                            "
                            variant="soft"
                            color="white"
                          />
                        </div>
                        <div>
                          <UBadge
                            label="Reef"
                            variant="soft"
                            color="gray"
                          />
                          <UBadge
                            :label="
                              !isNaN(team.teleAccData[4])
                                ? Math.round(team.teleAccData[4] * 1000) / 10 +
                                  '%'
                                : 'N/A'
                            "
                            variant="soft"
                            color="white"
                          />
                        </div>
                      </div>
                    </template>
                  </UPopover>
                  <UBadge
                    v-else
                    :label="team.autoAcc.data"
                    variant="soft"
                    :color="team.autoAcc.color"
                  />
                </td>
                <td class="text-center">
                  <UBadge
                    :label="team.endgamePoints.data"
                    variant="soft"
                    :color="team.endgamePoints.color"
                  />
                </td>
                <td class="text-center">
                  <UPopover mode="hover">
                    <UButton
                      class="m-1 mx-auto dark:bg-gray-700"
                      variant="soft"
                      icon="i-heroicons-chart-pie"
                      color="gray"
                    />
                    <template #panel>
                      <UCard>
                        <div
                          class="max-w-xs min-w-[10rem] overflow-y-auto"
                          style="max-height: 20rem; min-height: 10rem"
                        >
                          <PieChart
                            :labels="team.endgameChart.data[0]"
                            :data="team.endgameChart.data[1]"
                          />
                        </div>
                      </UCard>
                    </template>
                  </UPopover>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </UCard>
  </OuterComponents>
</template>

<style scoped></style>
