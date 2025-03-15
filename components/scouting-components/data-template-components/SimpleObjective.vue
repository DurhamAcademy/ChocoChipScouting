<script setup lang="ts">

import BooleanButton from "~/components/scouting-components/BooleanButton.vue";
import {computed} from "vue";
import Objective from "~/components/scouting-components/data-template-components/Objective.vue";

const props = defineProps<{
  template: SimpleObjectiveTemplate;
  modelValue: SimpleObjectiveData;
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

// instantiating the data object with empty objects
value.value = {
  objective: false
}

</script>

<template>
  <Objective :name="template.name">
    <BooleanButton
        class="mt-1"
        v-if="value"
        v-model="value.objective"
        :default-value="template.name"
        :other-value="template.name"
    />
  </Objective>
</template>

<style scoped>

</style>