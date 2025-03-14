<script setup lang="ts">
import Note from "~/components/scouting-components/data-template-components/Note.vue";

const props = defineProps<{
  template: NoteSectionTemplate;
  data: NoteSectionData;
}>();
</script>

<template>
  <div class="flex select-none">
    <UTooltip :text="data.selected ? 'Submitting' : 'Not Submitting'">
      <UToggle
        class="flex-0 mr-3 mt-0.5"
        v-model="data.selected"
      />
    </UTooltip>
    <URange
      class="flex-auto mt-1 ml-1"
      :disabled="!data.selected"
      :min="1"
      :max="template.rating_bar_max"
      v-model="data.rating"
    ></URange>
    <UBadge
      class="flex-auto ml-3 select-none"
      :label="data.rating"
      :variant="!data.selected ? 'outline' : 'solid'"
    ></UBadge>
  </div>
  <Note v-for="(prompt, index) of template.notes" :template="prompt" :data="data.notes[index]" />
</template>

<style scoped></style>
