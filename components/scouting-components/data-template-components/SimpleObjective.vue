<script setup lang="ts">

import BooleanButton from "~/components/scouting-components/BooleanButton.vue";
import {computed} from "vue";
import ObjectiveFormat from "~/components/scouting-components/data-template-components/ObjectiveFormat.vue";

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
  <ObjectiveFormat :name="template.name">
    <BooleanButton
        class="mt-1"
        v-if="value"
        v-model="value.objective"
        :default-value="template.name"
        :other-value="template.name"
    />
  </ObjectiveFormat>
</template>

<style scoped>

</style>