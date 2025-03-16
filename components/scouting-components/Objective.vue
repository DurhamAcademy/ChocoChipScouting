<script setup lang="ts">
import IncrementalButton from "~/components/scouting-components/scouting-component-utils/IncrementalButton.vue";
import {computed} from "vue";
import ObjectiveFormat from "~/components/scouting-components/ObjectiveFormat.vue";

const props = defineProps<{
  template: ObjectiveTemplate;
  modelValue: ObjectiveData;
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

// instantiating the data object with empty Objective obj
value.value = {
  count_made: 0,
  // instantiating count_missed as -1 if missed objectives arent being measured
  count_missed: 'missed' in props.template && props.template.missed ? 0 : -1
};

</script>

<template>
  <ObjectiveFormat :name="template.name">
    <div class="flex flex-auto justify-center">
      <div class="flex-auto text-center mx-1">
        <h1 class="text-coral-400 font-sans mt-1 font-light text-sm">
          Scored
        </h1>
        <IncrementalButton
            class="my-1"
            v-if="value"
            v-model="value.count_made"
        />
      </div>
      <div class="flex-auto text-center mx-1">
        <h1 v-if="template.missed" class="text-coral-400 font-sans mt-1 font-light text-sm">
          Missed
        </h1>
        <IncrementalButton
            class="my-1"
            v-if="value"
            v-model="value.count_missed"
        />
      </div>
    </div>
  </ObjectiveFormat>
</template>

<style scoped>

</style>