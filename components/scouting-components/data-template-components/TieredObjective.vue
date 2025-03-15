<script setup lang="ts">

import SingleSelect from "~/components/scouting-components/SingleSelect.vue";
import IncrementalButton from "~/components/scouting-components/IncrementalButton.vue";
import {computed} from "vue";
import ObjectiveFormat from "~/components/scouting-components/data-template-components/ObjectiveFormat.vue";

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