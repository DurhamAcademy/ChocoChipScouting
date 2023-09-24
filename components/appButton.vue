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
  <div class="w-full p-1">
    <UButton :label="text"
             :to="to"
             :trailing="false"
             block
             size="xl"
             square/>
  </div>
</template>

<style scoped>
</style>