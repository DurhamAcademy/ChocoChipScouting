<script setup lang="ts">
import databases from '~/utils/databases';
import IdMeta = PouchDB.Core.IdMeta;
import OuterComponents from '~/components/website-utils/OuterComponents.vue';
import {
  AllCommunityModule,
  ColDef,
  ColGroupDef,
  ColumnGroupOpenedEvent,
  GridApi,
  GridReadyEvent,
  ITooltipParams,
  ModuleRegistry,
  ValueFormatterParams,
} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import jsonData from '~/components/teams-utils/scouting-data-templates/2025.json';
import TeamCellRenderer from '~/components/teams-utils/teams-table-cell-renderers/TeamCellRenderer.vue';
import AttachmentsCellRenderer from '~/components/teams-utils/teams-table-cell-renderers/AttachmentsCellRenderer.vue';
import ColoredValueCellRenderer from '~/components/teams-utils/teams-table-cell-renderers/ColoredValueCellRenderer.vue';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

provide('scoutingTemplate', jsonData);

const components = {
  teamCellRenderer: TeamCellRenderer,
  attachmentsCellRenderer: AttachmentsCellRenderer,
  coloredValueCellRenderer: ColoredValueCellRenderer,
};

// from https://www.ag-grid.com/vue-data-grid/grid-lifecycle/#grid-ready
const gridApi = shallowRef<GridApi | null>(null);

const onGridReady = (params: GridReadyEvent) => {
  gridApi.value = params.api;

  params.api.autoSizeAllColumns();
};

const onColumnGroupOpened = (params: ColumnGroupOpenedEvent) => {
  // When a column group expands, auto-size all columns again
  params.api.autoSizeAllColumns();
};

const gridOptions = {
  suppressMovableColumns: true,
};

let currentEvent = useEventKey();
watch(currentEvent, () => {
  tableSetup();
});

interface TeamTableData {
  team_number: number;
  notes_overall_rating: number;
  [key: string]: number | string | undefined; // dynamic keys for all the computed fields
}

let teamsData = reactive<TeamTableData[]>([]);

async function tableSetup() {
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
          let arr = teamOrgMatches.get(teamNumber)!;
          arr.push(currentMatch);
          teamOrgMatches.set(teamNumber, arr);
        }
      }
    }
  }

  // clearing teamsData
  teamsData.length = 0;

  teamOrgMatches.forEach(
    (value: Array<ScoutingDataTest & IdMeta>, key: number) => {
      let scoutingData: ScoutingDataTest[] = value.map(
        ({ _id, ...scoutingData }) => scoutingData,
      );
      scoutingData.filter(
        scoutingData => scoutingData.event_key === currentEvent.value,
      );

      if (scoutingData.length === 0) return;

      const matchLength = scoutingData.length;

      const row: TeamTableData = {
        team_number: key,
        notes_overall_rating: 0,
      };

      // --- Process Notes ---
      const noteSections = jsonData.notes.note_sections;
      let overallRating = 0;

      noteSections.forEach((_, index) => {
        const notes = scoutingData.map(
          matchData => matchData.notes.note_sections[index] || { rating: 0 },
        );
        const avgRating =
          notes.reduce((sum, obj) => sum + obj.rating, 0) / matchLength;
        row[`notes_section_${index}_avg_rating`] = avgRating;
        overallRating += avgRating;
      });
      row.notes_overall_rating = overallRating;

      // --- Process Game Phases ---
      const phases: GamePhase[] = ['auto', 'teleop', 'endgame'];

      for (const phase of phases) {
        const phaseTemplate = jsonData[phase];

        // Helper to get data from all matches for this phase
        const getFromAllMatches = <T,>(key: string, index: number): T[] =>
          scoutingData.map(
            match => match[phase][key as ObjectiveType][index] as T,
          );

        // --- Tiered Objectives ---
        phaseTemplate.tiered_objectives.forEach((tieredObj, tieredIndex) => {
          const tieredData = getFromAllMatches<TieredObjectiveData>(
            'tiered_objectives',
            tieredIndex,
          );

          let tieredTotal = 0;

          tieredObj.objectives.forEach((_, objIndex) => {
            const allObjectivesOneTier = tieredData.map(
              t => t.objectives[objIndex] || { count_made: 0, count_missed: 0 },
            );

            const avgMade =
              allObjectivesOneTier.reduce(
                (sum, obj) => sum + obj.count_made,
                0,
              ) / matchLength;
            const avgMissed =
              allObjectivesOneTier.reduce(
                (sum, obj) => sum + obj.count_missed,
                0,
              ) / matchLength;
            const total = avgMade + avgMissed;
            const accuracy = total === 0 ? -1 : (avgMade / total) * 100;

            row[`${phase}_tiered_${tieredIndex}_obj_${objIndex}_made`] = avgMade;
            row[`${phase}_tiered_${tieredIndex}_obj_${objIndex}_missed`] = avgMissed;
            row[`${phase}_tiered_${tieredIndex}_obj_${objIndex}_accuracy`] = accuracy;

            tieredTotal += avgMade;
          });

          row[`${phase}_tiered_${tieredIndex}_total`] = tieredTotal;
        });

        // --- Special Objectives ---
        phaseTemplate.special_objectives.forEach((_, specIndex) => {
          const specialData = getFromAllMatches<SpecialObjectiveData>(
            'special_objectives',
            specIndex,
          );

          const optionCounts =
            specialData[0]?.options.map((_, optIndex) => {
              return specialData.reduce(
                (sum, obj) => sum + (obj.options[optIndex]?.selected ? 1 : 0),
                0,
              );
            }) || [];

          // Store as joined string for display
          row[`${phase}_special_${specIndex}_display`] =
            optionCounts.join(' / ');

          // Store individual option counts for potential sorting/filtering
          optionCounts.forEach((count, optIndex) => {
            row[`${phase}_special_${specIndex}_opt_${optIndex}`] = count;
          });
        });

        // --- Regular Objectives ---
        phaseTemplate.objectives.forEach((_, objIndex) => {
          const objectiveData = getFromAllMatches<ObjectiveData>(
            'objectives',
            objIndex,
          );

          const avgMade =
            objectiveData.reduce((sum, obj) => sum + obj.count_made, 0) /
            matchLength;
          const avgMissed =
            objectiveData.reduce((sum, obj) => sum + obj.count_missed, 0) /
            matchLength;
          const total = avgMade + avgMissed;
          const accuracy = total === 0 ? -1 : (avgMade / total) * 100;

          row[`${phase}_obj_${objIndex}_made`] = avgMade;
          row[`${phase}_obj_${objIndex}_missed`] = avgMissed;
          row[`${phase}_obj_${objIndex}_accuracy`] = accuracy;
        });

        // --- Simple Objectives ---
        phaseTemplate.simple_objectives.forEach((_, simpleIndex) => {
          const simpleData = getFromAllMatches<SimpleObjectiveData>(
            'simple_objectives',
            simpleIndex,
          );

          const countSelected = simpleData.reduce(
            (sum, obj) => sum + (obj.selected ? 1 : 0),
            0,
          );
          const countNotSelected = simpleData.reduce(
            (sum, obj) => sum + (!obj.selected ? 1 : 0),
            0,
          );
          const total = countSelected + countNotSelected;
          const percentage = total === 0 ? -1 : (countSelected / total) * 100;

          row[`${phase}_simple_${simpleIndex}_selected`] = countSelected;
          row[`${phase}_simple_${simpleIndex}_not_selected`] = countNotSelected;
          row[`${phase}_simple_${simpleIndex}_percentage`] = percentage;
        });
      }

      teamsData.push(row);
    },
  );

  // Now calculate column bounds for coloring
  calculateColumnBounds();
}

// https://www.ag-grid.com/vue-data-grid/deep-dive/#configure-columns
const colDefs = computed(() => buildColDefs(jsonData));

function buildColDefs(template: ScoutingDataTemplate) {
  const phases: GamePhase[] = ['auto', 'teleop', 'endgame'];

  // formatters
  const decimal = (v: number) => v.toFixed(1);
  const percent = (v: number) => v !== -1 ? v.toFixed(1) + '%' : 'N/A';

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

  // --- Notes/Ratings Col Defs ---
  const noteSections = template.notes.note_sections;
  if (noteSections.length > 0) {
    const maxTotal = noteSections.reduce(
      (sum, noteSec) => sum + noteSec.rating_bar_max,
      0,
    );
    colDefs.push({
      headerName: 'Ratings',
      groupId: `notes.note_sections`,
      children: [
        coloredCol(`Overall / ${maxTotal}`, 'notes_overall_rating', {
          formatter: decimal,
        }),
        ...noteSections.map((noteSec, index) =>
          coloredCol(
            `${noteSec.name} / ${noteSec.rating_bar_max}`,
            `notes_section_${index}_avg_rating`,
            { formatter: decimal, columnGroupShow: 'open' },
          ),
        ),
      ],
    });
  }

  // for each game phase (auto, teleop, endgame)
  for (const phase of phases) {
    const phaseTemplate = template[phase];
    const phaseCols: (ColGroupDef | ColDef)[] = [];

    // --- Tiered Objective Col Defs ---
    phaseTemplate.tiered_objectives.forEach((tieredObj, tieredIndex) => {
      phaseCols.push({
        headerName: tieredObj.name ?? `Tiered ${tieredIndex + 1}`,
        children: [
          coloredCol('Total', `${phase}_tiered_${tieredIndex}_total`, {
            formatter: decimal,
          }),
          ...tieredObj.objectives.map((obj, objIndex) => ({
            headerName: obj.name,
            columnGroupShow: 'open' as const,
            children: [
              coloredCol(
                'Made',
                `${phase}_tiered_${tieredIndex}_obj_${objIndex}_made`,
                {
                  formatter: decimal,
                },
              ),
              coloredCol(
                'Miss',
                `${phase}_tiered_${tieredIndex}_obj_${objIndex}_missed`,
                {
                  valueFormatter: (params: ValueFormatterParams) =>
                    params.value?.toFixed(1) ?? '0',
                },
                true,
              ),
              coloredCol(
                'Acc %',
                `${phase}_tiered_${tieredIndex}_obj_${objIndex}_accuracy`,
                {
                  formatter: percent,
                },
              ),
            ],
          })),
        ],
      });
    });

    // --- Special Objective Col Defs ---
    phaseTemplate.special_objectives.forEach((obj, specIndex) => {
      phaseCols.push({
        headerName: obj.name ?? `Special ${specIndex + 1}`,
        field: `${phase}_special_${specIndex}_display`,
        tooltipValueGetter: (params: ITooltipParams) => {
          return obj.options
            .map(
              (opt, i) =>
                `${opt.name}: ${params.data[`${phase}_special_${specIndex}_opt_${i}`] || 0}`,
            )
            .join(' | ');
        },
      });
    });

    // --- Objective Col Defs ---
    phaseTemplate.objectives.forEach((obj, objIndex) => {
      phaseCols.push({
        headerName: obj.name ?? `Objective ${objIndex + 1}`,
        children: [
          coloredCol('Made', `${phase}_obj_${objIndex}_made`, {
            formatter: decimal,
          }),
          coloredCol(
            'Miss',
            `${phase}_obj_${objIndex}_missed`,
            {
              columnGroupShow: 'open' as const,
              valueFormatter: (params: ValueFormatterParams) =>
                params.value?.toFixed(1) ?? '0',
            },
            true,
          ),
          coloredCol('Acc %', `${phase}_obj_${objIndex}_accuracy`, {
            formatter: percent,
            columnGroupShow: 'open',
          }),
        ],
      });
    });

    // --- Simple Objective Col Defs ---
    phaseTemplate.simple_objectives.forEach((simpleObj, simpleIndex) => {
      phaseCols.push(
        coloredCol(
          simpleObj.name ?? `Simple ${simpleIndex + 1}`,
          `${phase}_simple_${simpleIndex}_percentage`,
          { formatter: percent },
        ),
      );
    });

    colDefs.push({
      headerName: phase[0]!.toUpperCase() + phase.slice(1),
      children: phaseCols,
    });
  }

  return colDefs;
}

const columnBounds = reactive<Map<string, { min: number; max: number }>>(
  new Map(),
);

function calculateColumnBounds() {
  columnBounds.clear();

  if (teamsData.length === 0) return;

  // Get all numeric keys from first row
  const numericKeys = Object.keys(teamsData[0] as TeamTableData).filter(key => {
    return typeof (teamsData[0] as TeamTableData)[key] === 'number';
  });

  for (const key of numericKeys) {
    const values = teamsData
      .map(row => row[key])
      .filter(
        (v): v is number => typeof v === 'number' && !isNaN(v) && v !== -1,
      );

    if (values.length > 0) {
      columnBounds.set(key, {
        min: Math.min(...values),
        max: Math.max(...values),
      });
    }
  }
}

function coloredCol(
  headerName: string,
  field: string,
  options: {
    formatter?: (value: number) => string;
    valueFormatter?: (params: ValueFormatterParams) => any;
    columnGroupShow?: 'open' | 'closed';
  } = {},
  inverted?: boolean,
): ColDef {
  return {
    headerName: headerName,
    field: field,
    columnGroupShow: options.columnGroupShow,
    cellRenderer: 'coloredValueCellRenderer',
    valueFormatter: options.valueFormatter,
    cellRendererParams: {
      columnBounds,
      field,
      inverted,
      formatter: options.formatter,
    },
  };
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
      <div class="inline-block m-2">
        <UBadge label="Bad: 0%-33%" class="rounded-2xl" variant="soft" />
        <UBadge label="Ok: 33%-66%" class="rounded-2xl" variant="soft" color="gray" />
        <UBadge label="Good: 66%-90%" class="rounded-2xl" variant="soft" color="green" />
        <UBadge label="Insane: 90%-100%" class="rounded-2xl" variant="soft" color="blue" />
      </div>
      <div style="height: calc(100vh - 90px); width: 100%">
        <AgGridVue
          class="ag-theme-alpine"
          style="height: 100%; width: 100%"
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
