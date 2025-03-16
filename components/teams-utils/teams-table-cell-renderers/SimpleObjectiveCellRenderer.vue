<script setup lang="ts">

import PieChart from "~/components/charts/PieChart.vue";
import {defineProps} from "vue";

const props = defineProps<{
  template: SimpleObjectiveTemplate,
  data: SimpleObjectiveTableData
}>();

const simpleObjectiveOptionNames = ["Successful", "Unsuccessful"]
const simpleObjectiveData = [props.data.count_selected, props.data.count_not_selected]

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
              :labels="simpleObjectiveOptionNames"
              :data="simpleObjectiveData"
          />
      </UCard>
    </template>
  </UPopover>
</template>

<style scoped>

</style>