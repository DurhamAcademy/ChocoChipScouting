<script setup lang="ts">

import {defineProps} from "vue";
import ObjectiveCellRenderer from "~/components/teams-utils/teams-table-cell-renderers/ObjectiveCellRenderer.vue";
const props = defineProps<{
  template: TieredObjectiveTemplate,
  data: TieredObjectiveTableData,
}>();

const objectivesCountMade = props.data.objectives.map(objective => objective.average_count_made)
const totalObjectivesCountMade  = objectivesCountMade.reduce((accumulator, currentValue) => accumulator + currentValue, 0);


</script>

<template>
  <UPopover mode="hover">
    <UButton
        :label="String(totalObjectivesCountMade)"
        variant="soft"
    />
    <template #panel>
      <UCard class="flex">
        <template v-for="(objectiveData, index) of data.objectives">
          <ObjectiveCellRenderer
              :template="template.objectives[index]"
              :data="objectiveData"
              :missed="template.missed"
              :label="true"
          />
        </template>
      </UCard>
    </template>
  </UPopover>
</template>

<style scoped>

</style>