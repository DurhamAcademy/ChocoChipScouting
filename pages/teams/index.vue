<script setup lang="ts">
import databases, {
  type DataArrayOrSum,
  NoteData,
  type ScoutingData,
  type TeamTableData,
} from '~/utils/databases';
import IdMeta = PouchDB.Core.IdMeta;
import OuterComponents from '~/components/website-utils/OuterComponents.vue';
import {
  AllCommunityModule,
  ColDef,
  ColGroupDef,
  ModuleRegistry,
} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import jsonData from '~/components/teams-utils/scouting-data-templates/2025.json';
import TeamCellRenderer from '~/components/teams-utils/teams-table-cell-renderers/TeamCellRenderer.vue';
import AttachmentsCellRenderer from '~/components/teams-utils/teams-table-cell-renderers/AttachmentsCellRenderer.vue';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

provide('scoutingTemplate', jsonData);

const components = {
  teamCellRenderer: TeamCellRenderer,
  attachmentsCellRenderer: AttachmentsCellRenderer,
};

const gridApi = ref(null);

const onGridReady = (params: any) => {
  gridApi.value = params.api;

  params.api.autoSizeAllColumns();
};

const onColumnGroupOpened = (params) => {
  // When a column group expands, auto-size all columns again
  params.api.autoSizeAllColumns();
};

const gridOptions = {
  suppressMovableColumns: true,
}

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
  if (currentMatch !== undefined) {
    if (parseInt(currentMatch.match_number) != -1) {
      const teamNumber = parseInt(currentMatch.team_number);
      if (!teamOrgMatches.has(teamNumber)) {
        teamOrgMatches.set(teamNumber, [currentMatch]);
      } else {
        let arr: Array<ScoutingDataTest & IdMeta> =
          teamOrgMatches.get(teamNumber)!;
        arr.push(currentMatch);
        teamOrgMatches.set(teamNumber, arr);
      }
    }
  }
}

let teamsData = reactive<TeamTableDataTest[]>([]);

async function tableSetup() {
  teamOrgMatches.forEach(
    (value: Array<ScoutingDataTest & IdMeta>, key: number) => {
      let scoutingData: ScoutingDataTest[] = value.map(
        ({ _id, ...scoutingData }) => scoutingData,
      );
      scoutingData.filter(
        scoutingData => scoutingData.event_key === currentEvent.value,
      );
      const matchLength = scoutingData.length;

      // Helper functions to avoid repetition
      const calculateObjectiveData = (
        objectives: ObjectiveData[],
      ): ObjectiveTableData => ({
        average_count_made:
          objectives.reduce((sum, obj) => sum + obj.count_made, 0) /
          matchLength,
        average_count_missed:
          objectives.reduce((sum, obj) => sum + obj.count_missed, 0) /
          matchLength,
      });

      const calculateSimpleObjectiveData = (
        objectives: SimpleObjectiveData[],
      ): SimpleObjectiveTableData => ({
        count_selected: objectives.reduce(
          (sum, obj) => sum + (obj.selected ? 1 : 0),
          0,
        ),
        count_not_selected: objectives.reduce(
          (sum, obj) => sum + (!obj.selected ? 1 : 0),
          0,
        ),
      });

      const calculateSpecialObjectiveData = (
        objectives: SpecialObjectiveData[],
      ): SpecialObjectiveTableData => ({
        options: Array.from({ length: objectives[0]?.options.length || 0 }).map(
          (_, optionIndex) => {
            const allObjectivesOneOption = objectives.map(
              objective => objective.options[optionIndex],
            );
            return {
              count_selected: allObjectivesOneOption.reduce(
                (sum, obj) => sum + (obj?.selected ? 1 : 0),
                0,
              ),
            };
          },
        ),
      });

      const calculateTieredObjectiveData = (
        objectives: TieredObjectiveData[],
      ): TieredObjectiveTableData => ({
        objectives: Array.from({
          length: objectives[0]?.objectives.length || 0,
        }).map((_, objectiveIndex) => {
          const allObjectivesOneTier = objectives.map(
            objective =>
              objective.objectives[objectiveIndex] || {
                count_made: 0,
                count_missed: 0,
              },
          );
          return calculateObjectiveData(allObjectivesOneTier);
        }),
      });

      // Process a game phase (auto, teleop, endgame)
      const processGamePhase = (phase: GamePhase) => {
        const getFromAllMatches = <T,>(
          key: keyof ScoutingDataTest[GamePhase],
          index: number,
        ): T[] => scoutingData.map(match => match[phase][key][index] as T);

        return {
          tiered_objectives: jsonData[phase].tiered_objectives.map((_, i) =>
            calculateTieredObjectiveData(
              getFromAllMatches<TieredObjectiveData>('tiered_objectives', i),
            ),
          ),

          simple_objectives: jsonData[phase].simple_objectives.map((_, i) =>
            calculateSimpleObjectiveData(
              getFromAllMatches<SimpleObjectiveData>('simple_objectives', i),
            ),
          ),

          special_objectives: jsonData[phase].special_objectives.map((_, i) => {
            const specialData = getFromAllMatches<SpecialObjectiveData>(
              'special_objectives',
              i,
            );
            return calculateSpecialObjectiveData(
              getFromAllMatches<SpecialObjectiveData>('special_objectives', i),
            );
          }),

          objectives: jsonData[phase].objectives.map((_, i) =>
            calculateObjectiveData(
              getFromAllMatches<ObjectiveData>('objectives', i),
            ),
          ),
        };
      };

      const teamData: TeamTableDataTest = {
        team_number: key,
        auto: processGamePhase('auto'),
        teleop: processGamePhase('teleop'),
        endgame: processGamePhase('endgame'),
        notes: {
          note_sections: Array.from({
            length: jsonData.notes.note_sections.length,
          }).map((_, index) => {
            const notes: NoteSectionData[] = scoutingData.map(
              matchData =>
                matchData.notes.note_sections[index] || {
                  selected: false,
                  rating: 0,
                  notes: [],
                },
            );
            return {
              average_rating:
                notes.reduce((sum, obj) => sum + obj.rating, 0) / matchLength,
            };
          }),
        },
      };
      teamsData.push(teamData);
    },
  );
}

// https://www.ag-grid.com/vue-data-grid/deep-dive/#configure-columns
const colDefs = ref<(ColGroupDef | ColDef)[]>(buildColDefs(jsonData));

function buildColDefs(template: ScoutingDataTemplate) {
  const phases: GamePhase[] = ['auto', 'teleop', 'endgame'];

  let colDefs: (ColGroupDef | ColDef)[] = [
    {
      headerName: 'Team',
      children: [
        {
          field: 'team_number',
          headerName: 'Number',
          filter: 'agTextColumnFilter',
          cellRenderer: 'teamCellRenderer',
        },
        {
          headerName: 'Photos',
          cellRenderer: 'attachmentsCellRenderer',
          sortable: false,
        },
      ],
    },
  ];

  const noteSections = template.notes.note_sections;
  if (noteSections.length > 0) {
    colDefs.push({
      headerName: 'Ratings',
      groupId: `notes.note_sections`,
      children: [
        {
          headerName: `Overall / ${String(noteSections.reduce((sum, noteSec) => sum + noteSec.rating_bar_max, 0))}`,
          columnGroupShow: 'closed',
          valueGetter: params => {
            const data: NoteSectionTableData[] = params.data.notes.note_sections;
            return data.reduce((sum, noteSec) => sum + noteSec.average_rating, 0)
          },
          valueFormatter: params => {
            return params.value.toFixed(1)
          },
        },
        ...noteSections.map((noteSec, index) => ({
          headerName: `${noteSec.name} / ${String(noteSec.rating_bar_max)}`,
          columnGroupShow: "open" as const,
          valueGetter: params => {
            const data: NoteSectionTableData =
              params.data.notes.note_sections[index];
            return data.average_rating;
          },
          valueFormatter: params => {
            return params.value.toFixed(1)
          }
        })),
      ],
    });
  }

  for (const phase of phases) {
    const phaseTemplate = template[phase];

    const phaseCols = [];

    const tieredObjectives = phaseTemplate.tiered_objectives;

    // --- Tiered Objective Col Defs ---
    phaseCols.push(
      ...tieredObjectives.map((tieredObj, index) => ({
        headerName: tieredObj.name ?? `Tiered ${index + 1}`,
        groupId: `${phase}.tiered.${index}`,
        children: [
          {
            headerName: 'Total',
            valueGetter: params => {
              const data: TieredObjectiveTableData =
                params.data[phase].tiered_objectives[index];
              if (!data) return 0;
              return data.objectives.reduce(
                (sum, obj) => sum + obj.average_count_made,
                0,
              );
            },
            width: 0
          },
          ...tieredObj.objectives.map((obj, objIndex) => ({
            headerName: obj.name,
            columnGroupShow: 'open',
            children: [
              {
                headerName: 'Made',
                field: `${phase}.tiered_objectives.${index}.objectives.${objIndex}.average_count_made`,
                columnGroupShow: 'open',
                width: 0
              },
              {
                headerName: 'Miss',
                field: `${phase}.tiered_objectives.${index}.objectives.${objIndex}.average_count_missed`,
                columnGroupShow: 'open',
                width: 0
              },
              {
                headerName: 'Acc %',
                valueGetter: params => {
                  const data =
                    params.data[phase].tiered_objectives[index]?.objectives[
                      objIndex
                    ];
                  if (!data) return 0;
                  const total =
                    data.average_count_made + data.average_count_missed;
                  if (total === 0) return 0;
                  return ((data.average_count_made / total) * 100);
                },
                columnGroupShow: 'open',
                valueFormatter: params => {
                  const data =
                    params.data[phase].tiered_objectives[index]?.objectives[
                      objIndex
                      ];
                  if (!data)  return 'N/A';
                  const total =
                    data.average_count_made + data.average_count_missed;
                  if (total === 0) return 'N/A';
                  return params.value.toFixed(1) + "%"
                },
                width: 0
              },
            ],
          })),
        ],
      })),
    );

    // --- Special Objective Col Defs ---
    phaseCols.push(
      ...phaseTemplate.special_objectives.map((obj, index) => ({
        headerName: obj.name ?? `Special ${index + 1}`,
        field: `${phase}.special_objectives.${index}`,
        valueGetter: params => {
          const data: SpecialObjectiveTableData = params.data[phase].special_objectives[index];
          if (!data) return '';
          // Show the counts as text, e.g., "5 / 3 / 2"
          return data.options.map(opt => opt.count_selected).join(' / ');
        },
        tooltipValueGetter: params => {
          const data: SpecialObjectiveTableData = params.data[phase].special_objectives[index];
          const template: SpecialObjectiveTemplate = jsonData[phase].special_objectives[index];
          if (!data || !template) return '';
          // Show option names with their counts in tooltip
          return template.options.map((opt, i) =>
            `${opt.name}: ${data.options[i]?.count_selected || 0}`
          ).join('\n');
        }
      })),
    );

    const objectives = phaseTemplate.objectives;

    // --- Objective Col Defs ---
    phaseCols.push(
      ...objectives.map((obj, index) => ({
        headerName: obj.name ?? `Objective ${index + 1}`,
        groupId: `${phase}.objective.${index}`,
        children: [
          {
            headerName: 'Made',
            columnGroupShow: 'closed',
            field: `${phase}.objectives.${index}.average_count_made`,
          },
          {
            headerName: 'Made',
            columnGroupShow: 'open',
            field: `${phase}.objectives.${index}.average_count_made`,
          },
          {
            headerName: 'Miss',
            columnGroupShow: 'open',
            field: `${phase}.objectives.${index}.average_count_missed`,
          },
          {
            headerName: 'Acc %',
            columnGroupShow: 'open',
            valueGetter: params => {
              const data = params.data[phase].objectives[index];
              if (!data) return '0.0';
              const total = data.average_count_made + data.average_count_missed;
              if (total === 0) return '0.0';
              return ((data.average_count_made / total) * 100).toFixed(1);
            },
          },
        ],
      })),
    );

    const simpleObjectives = phaseTemplate.simple_objectives;

    // --- Simple Objective Col Defs ---
    phaseCols.push(
      ...simpleObjectives.map((simpleObj, index) => ({
        headerName: simpleObj.name ?? `Simple ${index + 1}`,
        field: `${phase}.simple_objectives.${index}`,
        valueGetter: params => {
          const data = params.data[phase].simple_objectives[index];
          if (!data) return '0.0';

          const total = data.count_selected + data.count_not_selected;
          if (total === 0) return '0.0';
          return ((data.count_selected / total) * 100)
        },
        valueFormatter: params => {
          return params.value.toFixed(1) + "%";
        }
      })),
    );

    colDefs.push({
      headerName: phase[0]?.toUpperCase() + phase.slice(1),
      children: phaseCols,
    });
  }

  return colDefs;
}

const defaultColDef = ref({
  sortable: true,
  filter: false,
  resizable: false,
  minWidth: 90,
});

await tableSetup();

</script>

<template>
  <OuterComponents class="z-[11]">
    <UCard>
      <!-- Legend -->
      <div class="inline-block m-2">
        <UBadge label="Bad: 0%-33%" class="rounded-2xl" variant="soft" />
        <UBadge label="Ok: 33%-66%" class="rounded-2xl" variant="soft" color="gray" />
        <UBadge label="Good: 66%-90%" class="rounded-2xl" variant="soft" color="green" />
        <UBadge label="Insane: 90%-100%" class="rounded-2xl" variant="soft" color="blue" />
      </div>

      <!-- Grid with viewport-based height -->
      <div style="height: calc(100vh - 90px); width: 100%;">
        <AgGridVue
          class="ag-theme-alpine"
          style="height: 100%; width: 100%;"
          :grid-options="gridOptions"
          :columnDefs="colDefs"
          :rowData="teamsData"
          :defaultColDef="defaultColDef"
          :components="components"
          @grid-ready="onGridReady"
          @column-group-opened="onColumnGroupOpened"
        />
      </div>
    </UCard>
  </OuterComponents>
</template>

<style scoped></style>
