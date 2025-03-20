<script setup lang="ts">
import databases, {
  type DataArrayOrSum,
  type ScoutingData,
  type TeamTableData,
} from '~/utils/databases';
import IdMeta = PouchDB.Core.IdMeta;
import PieChart from '~/components/charts/PieChart.vue';
import OuterComponents from '~/components/website-utils/OuterComponents.vue';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridVue } from "ag-grid-vue3"; // Vue Data Grid Component
import jsonData from "~/components/teams-utils/scouting-data-templates/2025.json";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

let currentEvent = useEventKey();
watch(currentEvent, () => {
  tableSetup();
});

const { scoutingData: db } = databases.locals;

const matches = (await db.allDocs()).rows;
let match = matches.map(async (doc): Promise<ScoutingDataTest & IdMeta> => {
  return await db.get(doc.id);
});

let teamOrgMatches = new Map<number, Array<ScoutingDataTest & IdMeta>>();

for (let i = 0; i < match.length; i++) {
  let currentMatch = await match[i];
  if (parseInt(currentMatch.match_number) != -1) {
    const teamNumber = parseInt(currentMatch.team_number)
    if (!teamOrgMatches.has(teamNumber)) {
      teamOrgMatches.set(teamNumber, [currentMatch]);
    } else {
      let arr: Array<ScoutingDataTest & IdMeta> = teamOrgMatches.get(teamNumber)!;
      arr.push(currentMatch);
      teamOrgMatches.set(teamNumber, arr);
    }
  }
}

let teamsData = reactive<TeamTableDataTest[]>([]);

async function tableSetup() {
  teamOrgMatches.forEach((value: Array<ScoutingDataTest & IdMeta>, key: number) => {
    let scoutingData: ScoutingDataTest[] = value.map(({_id, ...scoutingData}) => scoutingData)
    scoutingData.filter(scoutingData => scoutingData.event_key === currentEvent.value)
    const matchLength = scoutingData.length

    // Helper functions to avoid repetition
    const calculateObjectiveData = (objectives: ObjectiveData[]): ObjectiveTableData => ({
      average_count_made: objectives.reduce((sum, obj) => sum + obj.count_made, 0) / matchLength,
      average_count_missed: objectives.reduce((sum, obj) => sum + obj.count_missed, 0) / matchLength
    });

    const calculateSimpleObjectiveData = (objectives: SimpleObjectiveData[]): SimpleObjectiveTableData => ({
      count_selected: objectives.reduce((sum, obj) => sum + (obj.selected ? 1 : 0), 0),
      count_not_selected: objectives.reduce((sum, obj) => sum + (!obj.selected ? 1 : 0), 0)
    });

    const calculateSpecialObjectiveData = (objectives: SpecialObjectiveOptionData[][]): SpecialObjectiveTableData => ({
      options: Array.from({length: objectives[0]?.length || 0}).map((_, optionIndex) => {
        const allObjectivesOneOption = objectives.map(objective => objective[optionIndex]);
        return {
          count_selected: allObjectivesOneOption.reduce((sum, obj) => sum + (obj.selected ? 1 : 0), 0)
        };
      })
    });

    const calculateTieredObjectiveData = (objectives: ObjectiveData[][]): TieredObjectiveTableData => ({
      objectives: Array.from({length: objectives[0]?.length || 0}).map((_, objectiveIndex) => {
        const allObjectivesOneTier = objectives.map(objective => objective[objectiveIndex]);
        return calculateObjectiveData(allObjectivesOneTier);
      })
    });

    // Process a game phase (auto, teleop, endgame)
    const processGamePhase = (phase: GamePhase) => {
      const processObjectivesByType = <T, R>(
          objectiveType: string,
          length: number,
          mapFn: (index: number) => T[],
          calculateFn: (data: T[]) => R
      ) => Array.from({length}).map((_, index) => calculateFn(mapFn(index)));

      return {
        tiered_objectives: processObjectivesByType<ObjectiveData[], TieredObjectiveTableData>(
            'tiered_objectives',
            jsonData[phase].tiered_objectives.length,
            index => scoutingData.map(matchData => matchData[phase].tiered_objectives[index].objectives),
            calculateTieredObjectiveData
        ),

        simple_objectives: processObjectivesByType<SimpleObjectiveData, SimpleObjectiveTableData>(
            'simple_objectives',
            jsonData[phase].simple_objectives.length,
            index => scoutingData.map(matchData => matchData[phase].simple_objectives[index]),
            calculateSimpleObjectiveData
        ),

        special_objectives: processObjectivesByType<SpecialObjectiveOptionData[], SpecialObjectiveTableData>(
            'special_objectives',
            jsonData[phase].special_objectives.length,
            index => scoutingData.map(matchData => matchData[phase].special_objectives[index].options),
            calculateSpecialObjectiveData
        ),

        objectives: processObjectivesByType<ObjectiveData, ObjectiveTableData>(
            'objectives',
            jsonData[phase].objectives.length,
            index => scoutingData.map(matchData => matchData[phase].objectives[index]),
            calculateObjectiveData
        ),
      };
    };

    const teamData: TeamTableDataTest = {
      team_number: key,
      auto: processGamePhase('auto'),
      teleop: processGamePhase('teleop'),
      endgame: processGamePhase('endgame'),
      notes: {
        note_sections: Array.from({length: jsonData.notes.note_sections.length}).map((_, index) => {
          const notes: NoteSectionData[] = scoutingData.map(matchData => matchData.notes.note_sections[index]);
          return {
            average_rating: notes.reduce((sum, obj) => sum + obj.rating, 0) / matchLength
          };
        })
      }
    };

    teamsData.push(teamData);
  });
}

await tableSetup();

</script>

<template>
  <OuterComponents class="z[11]">
    <UCard
      class="max-h-[93ex] overflow-y-scroll dark:bg-gray-800"
    >
      <template #header>
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
        <AgGridVue
            :columnDefs="columnDefs"
            :rowData="teamsData"
            :defaultColDef="defaultColDef"
            :frameworkComponents="frameworkComponents"
            @grid-ready="onGridReady"
        />
    </UCard>
  </OuterComponents>
</template>

<style scoped></style>
