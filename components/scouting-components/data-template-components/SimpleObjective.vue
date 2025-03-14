<script setup lang="ts">

import BooleanButton from "~/components/scouting-components/BooleanButton.vue";

const props = defineProps<{
  template: SimpleObjectiveTemplate;
  data: SimpleObjectiveData;
}>();

</script>

<template>
  <BooleanButton
      class="mt-1"
      v-model="data.objective"
      :default-value="template.name"
      :other-value="template.name"
  />
</template>

<style scoped>

</style>