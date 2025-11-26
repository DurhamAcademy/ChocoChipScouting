<script setup lang="ts">

import PromptedNote from "~/components/scouting-components/scouting-component-utils/PromptedNote.vue";

const props = defineProps<{
  template: NoteSectionTemplate[];
  modelValue: NoteSectionData[];
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

// function to declare an empty NoteSectionData obj
function createNoteSectionData(noteSectionTemplate: NoteSectionTemplate): NoteSectionData {
  return {
    selected: false,
    rating: 1,
    notes: noteSectionTemplate.notes.map(() => createNoteData())
  }
}

// function to declare an empty NoteData obj
function createNoteData(): NoteData {
  return {
    notes: ""
  };
}

// Create tabs array for UAccordion
const tabs = computed(() => {
  return props.template.map(section => ({
    label: section.name,
    slot: section.name,
    // You may add other properties that UAccordion expects
  }));
});

// instantiating the data object with empty objects
value.value = props.template.map(noteSectionTemplate => createNoteSectionData(noteSectionTemplate))

</script>

<template>
  <UAccordion :items="tabs">
    <template v-for="(noteSection, index) in template" #[noteSection.name] >
      <PromptedNote
          :template="noteSection"
          v-model="value[index]!"
      />
    </template>
  </UAccordion>
</template>

<style scoped>

</style>