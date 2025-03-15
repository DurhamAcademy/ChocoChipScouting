<script setup lang="ts">
import IncrementalButton from "~/components/scouting-components/IncrementalButton.vue";
import {computed} from "vue";
import ObjectiveFormat from "~/components/scouting-components/data-template-components/ObjectiveFormat.vue";

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
  count_missed: 0
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