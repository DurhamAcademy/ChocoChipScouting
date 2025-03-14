<script setup lang="ts">

import {promptedNoteOptions} from "~/utils/promptedNoteOptions";
import {NoteTemplate} from "~/utils/databases";
import PromptedNote from "~/components/scouting-components/PromptedNote.vue";
import jsonData from "~/components/teams-utils/scouting-data-templates/2025.json";

const props = defineProps<{
  template: NoteSectionTemplate[];
  data: NoteSectionData[];
}>();

const notePromptOptions = props.template.notes.map(note => note.prompt)

</script>

<template>
  <UAccordion :items="tabs">
    <template v-for="(noteSection, index) in template" #[noteSection.name] >
      <PromptedNote
          :template="noteSection"
          v-model="data[index]"
      />
    </template>
  </UAccordion>
</template>

<style scoped>

</style>