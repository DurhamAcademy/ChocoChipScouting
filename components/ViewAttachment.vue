<script setup lang="ts">
const props = defineProps({name: String, author: String, team: Number, attachments: [URL]})
</script>

<template>
<UCard>
  <template #header>
    <div class="flex">
      {{name}}
    </div>
  </template>
</UCard>
</template>

<style scoped>

</style>