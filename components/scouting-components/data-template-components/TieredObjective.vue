<script setup lang="ts">

import SingleSelect from "~/components/scouting-components/SingleSelect.vue";
import IncrementalButton from "~/components/scouting-components/IncrementalButton.vue";
import {computed} from "vue";
import Objective from "~/components/scouting-components/data-template-components/Objective.vue";

const props = defineProps<{
  template: TieredObjectiveTemplate;
  modelValue: TieredObjectiveData;
}>();

// emits for updating the inputted ref prop
const emit = defineEmits(['update:modelValue']);
const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

// function to declare an empty ObjectiveData obj
function createObjectiveData(): ObjectiveData {
  return {
    count_made: 0,
    count_missed: 0
  };
}

// instantiating the data object with empty objects
value.value = {
  objectives: props.template.objectives.map(() => createObjectiveData())
};

const tieredObjectiveOptions = props.template.objectives.map(objective => objective.name);
const objectiveType = ref(tieredObjectiveOptions[0]);

</script>

<template>
  <Objective :name="template.name">
    <div class="flex flex-auto justify-center">
      <div class="flex-auto text-center mx-1">
        <h1 class="text-coral-400 font-sans mt-1 font-light text-sm">
          Scored
        </h1>
        <template v-for="(objective, index) of template.objectives">
          <IncrementalButton
              class="my-1"
              v-if="value && objectiveType === objective.name"
              v-model="value.objectives[index].count_made"
          />
        </template>
      </div>
      <div class="flex-auto text-center mx-1">
        <h1 v-if="template.missed" class="text-coral-400 font-sans mt-1 font-light text-sm">
          Missed
        </h1>
        <template v-for="(objective, index) of template.objectives">
          <IncrementalButton
              class="my-1"
              v-if="value && objectiveType === objective.name"
              v-model="value.objectives[index].count_missed"
          />
        </template>
      </div>
    </div>
    <SingleSelect
        v-model="objectiveType"
        :options="tieredObjectiveOptions"
    />
  </Objective>
</template>

<style scoped>

</style>