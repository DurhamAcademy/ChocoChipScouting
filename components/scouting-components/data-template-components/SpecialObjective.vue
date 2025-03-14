<script setup lang="ts">

import MultiSelect from "~/components/scouting-components/MultiSelect.vue";

const props = defineProps<{
  template: SpecialObjectiveTemplate;
  data: SpecialObjectiveData;
}>();

objectiveOptions = props.template.options.map(option => option.name)

/**
 * updateEndgameOptions updates the scoutData variable to match the currently selected option in the endgame multiselect
 * @param value the currently selected option
 */
function updateEndgameOptions(value: Array<number>) {
  let count = 0
  value.forEach((value, index) => {
    props.data.options[index].selected = Boolean(value);
    count++;
  })
  if (count < 1) {
    props.data.options[0].selected = true;
  }
}

</script>


<template>
  <!-- a multi select custom component. this acts like the single select but allows you to select multiple buttons at a time.
        the connection options optional param allows you to configure which options are allowed to be selected with each other
        notice the @update: which runs the updateEndgameOptions() function upon each update of the custom component-->
  <MultiSelect
      :model-value="[...data.options.map(0)]"
      :options="objectiveOptions"
      @update:model-value="
            value => {
              updateEndgameOptions(value);
            }
          "
      :connected-options="template.options.map(option => option.connected_options)"
  />
</template>

<style scoped>

</style>