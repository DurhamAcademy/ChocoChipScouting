<script setup lang="ts">

import SingleSelect from "~/components/scouting-components/SingleSelect.vue";
import IncrementalButton from "~/components/scouting-components/IncrementalButton.vue";

const props = defineProps<{
  template: TieredObjectiveTemplate;
  data: TieredObjectiveData;
}>();

const tieredObjectiveOptions = props.template.objectives.map(objective => objective.name);

</script>

<template>
  <div class="w-fit text-center ml-4">
    <h1
        class="text-gray-700 dark:text-gray-200 font-sans font-bold"
    >
      {{ template.name }}
    </h1>
    <div class="flex flex-auto justify-center max-w-44">
      <div class="flex-auto text-center mx-1">
        <h1
            class="text-coral-400 font-sans mt-1 font-light text-sm"
        >
          Scored
        </h1>
        <IncrementalButton v-for="(objective, index) of data.objectives"
                           class="my-1"
                           v-model="objective.count_made"
                           v-if="objectiveType == template.objectives[index].name" />
      </div>
    </div>
    <div class="flex-auto text-center mx-1">
      <h1 v-if="template.missed"
          class="text-coral-400 font-sans mt-1 font-light text-sm"
      >
        Missed
      </h1>
      <IncrementalButton v-for="(objective, index) of data.objectives"
                         class="my-1"
                         v-model="objective.count_missed"
                         v-if="objectiveType == template.objectives[index].name" />
    </div>
    <div class="ml-0.5">
      <SingleSelect
          v-model="objectiveType"
          :options="tieredObjectiveOptions"
      />
    </div>
  </div>
</template>

<style scoped>

</style>