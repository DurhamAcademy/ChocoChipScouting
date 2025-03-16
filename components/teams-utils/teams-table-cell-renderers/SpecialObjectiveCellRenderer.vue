<script setup lang="ts">

import PieChart from "~/components/charts/PieChart.vue";
import {defineProps} from "vue";

const props = defineProps<{
  template: SpecialObjectiveTemplate,
  data: SpecialObjectiveTableData,
}>();

const specialObjectiveOptionNames = props.template.options.map(option => option.name)
const specialObjectiveData = props.data.options.map(objectiveData => objectiveData.count_selected)

</script>

<template>
  <UPopover mode="hover">
    <UButton
        variant="soft"
        icon="i-heroicons-chart-pie"
    />
    <template #panel>
      <UCard>
        <PieChart
              :labels="specialObjectiveOptionNames"
              :data="specialObjectiveData"
          />
      </UCard>
    </template>
  </UPopover>
</template>

<style scoped>

</style>