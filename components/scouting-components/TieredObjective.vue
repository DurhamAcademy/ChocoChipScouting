<script setup lang="ts">

import SingleSelect from "~/components/scouting-components/scouting-component-utils/SingleSelect.vue";
import IncrementalButton from "~/components/scouting-components/scouting-component-utils/IncrementalButton.vue";
import {computed} from "vue";
import ObjectiveFormat from "~/components/scouting-components/ObjectiveFormat.vue";

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
function createObjectiveData(index: number): ObjectiveData {
  return {
    count_made: 0,
    // instantiating count_missed as -1 if missed objectives arent being measured
    count_missed: props.template.missed || ('missed' in props.template.objectives[index] && props.template.objectives[index].missed) ? 0 : -1
  };
}

// instantiating the data object with empty objects
value.value = {
  objectives: props.template.objectives.map((_, index) => createObjectiveData(index))
};

const tieredObjectiveOptions = props.template.objectives.map(objective => objective.name);
const objectiveType = ref(tieredObjectiveOptions[0]);

</script>

<template>
  <ObjectiveFormat :name="template.name">
    <div class="flex flex-auto justify-center">
      <template v-for="(objective, index) of template.objectives" class="flex-auto text-center">
        <div v-if="value && objective && objectiveType === objective.name">
          <h1 class="text-coral-400 font-sans mt-1 font-light text-sm">
            Scored
          </h1>
          <IncrementalButton
              class="m-1"
              v-model="value.objectives[index].count_made"
          />
        </div>
      </template>
      <template v-for="(objective, index) of template.objectives" class="flex-auto text-center">
        <div v-if="value && objective && objectiveType === objective.name && ('missed' in objective && objective.missed != undefined ? objective.missed : template.missed)">
          <h1 class="text-coral-400 font-sans mt-1 font-light text-sm">
            Missed
          </h1>
          <IncrementalButton
              class="m-1"
              v-model="value.objectives[index].count_missed"
          />
        </div>
      </template>
    </div>
    <SingleSelect
        v-model="objectiveType"
        :options="tieredObjectiveOptions"
    />
  </ObjectiveFormat>
</template>

<style scoped>

</style>