<script setup lang="ts">
const props = defineProps({
  to: String,
  text: String
})
</script>

<template>
  <nuxt-link :to="to"><div class="app-button" >{{ text }}</div></nuxt-link>
</template>

<style scoped>
.app-button {
  width: 10ch;
  height: 10ch;
  border: black 1px solid;
  padding: 1ch 1ch;
  margin: 1ch;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>