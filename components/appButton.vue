<script setup lang="ts">
const props = defineProps({
  to: String,
  text: {
    type: String,
    default: ""
  }
})
</script>

<template>
  <UButton :label="text"
           :trailing="false"
           block
           size="xl"
           square
           variant="outline"/>
</template>

<style scoped>
</style>