<script setup lang="ts">

import {NoteTemplate} from "~/utils/databases";

const props = defineProps<{
  template: NoteTemplate;
  data: NoteData;
}>();

</script>

<template>
  <UTextarea
      v-model="data.notes"
      color="red"
      :placeholder="template.prompt"
  />
</template>

<style scoped>

</style>