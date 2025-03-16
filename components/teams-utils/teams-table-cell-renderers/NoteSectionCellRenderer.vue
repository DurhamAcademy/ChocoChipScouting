<script setup lang="ts">

import {defineProps} from "vue";

const props = defineProps<{
  template: NoteSectionTemplate,
  data: NoteSectionTableData,
}>();


</script>

<template>
  <UBadge
      :label="data.average_rating"
      variant="soft"
  />
</template>

<style scoped>

</style>