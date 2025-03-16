<script setup lang="ts">
import Note from "~/components/scouting-components/Note.vue";

const props = defineProps<{
  template: NoteSectionTemplate;
  modelValue: NoteSectionData;
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
function createNoteSectionData(noteSectionTemplate: NoteSectionTemplate): GroupNoteData {
  return {
    selected: false,
    rating: 0,
    notes: noteSectionTemplate.notes.map(() => createNoteData())
  }
}

// function to declare an empty NoteData obj
function createNoteData(): NoteData {
  return {
    notes: ""
  };
}

// instantiating the data object with empty objects
value.value = createNoteSectionData(props.template)


</script>

<template>
  <div class="flex select-none">
    <UTooltip v-if="value" :text="value.selected ? 'Submitting' : 'Not Submitting'">
      <UToggle
        class="flex-0 mr-3 mt-0.5"
        v-if="value"
        v-model="value.selected"
      />
    </UTooltip>
    <URange
      class="flex-auto mt-1 ml-1"
      v-if="value"
      :disabled="!value.selected"
      :min="1"
      :max="template.rating_bar_max"
      v-model="value.rating"
    ></URange>
    <UBadge
      class="flex-auto ml-3 select-none"
      v-if="value"
      :label="value.rating"
      :variant="!value.selected ? 'outline' : 'solid'"
    ></UBadge>
  </div>
  <Note v-if="value" v-for="(prompt, index) of template.notes" :template="prompt" v-model="value.notes[index]" />
</template>

<style scoped></style>
