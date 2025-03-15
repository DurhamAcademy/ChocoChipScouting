<script setup lang="ts">

import {NoteTemplate} from "~/utils/databases";

const props = defineProps<{
  template: NoteTemplate;
  modelValue: NoteData;
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

value.value = {
  notes: ""
}

</script>

<template>
  <UTextarea
      class="mt-5"
      v-if="value"
      v-model="value.notes"
      color="red"
      :placeholder="template.prompt"
  />
</template>

<style scoped>

</style>