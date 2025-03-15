<script setup lang="ts">

import MultiSelect from "~/components/scouting-components/MultiSelect.vue";
import ObjectiveFormat from "~/components/scouting-components/data-template-components/ObjectiveFormat.vue";

const props = defineProps<{
  template: SpecialObjectiveTemplate;
  modelValue: SpecialObjectiveData;
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

// function to declare an empty SpecialObjectiveOptionData obj
function createSpecialObjectiveOptionData(): SpecialObjectiveOptionData {
  return {
    selected: false
  };
}

// instantiating the data object with empty objects
value.value = {
  options: props.template.options.map(() => createSpecialObjectiveOptionData())
}

</script>


<template>
  <ObjectiveFormat :name="template.name">
    <!-- a multi select custom component. this acts like the single select but allows you to select multiple buttons at a time.
        the connection options optional param allows you to configure which options are allowed to be selected with each other -->
    <MultiSelect
        v-if="value"
        v-model="value.options"
        :options="template.options.map(option => option.name)"
        :connected-options="template.options.map(option => option.connected_options)"
    />
  </ObjectiveFormat>
</template>

<style scoped>

</style>