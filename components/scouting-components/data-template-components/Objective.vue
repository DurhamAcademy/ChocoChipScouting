<script setup lang="ts">

const props = defineProps<{
  name?: string;
}>();

</script>

<template>
 <UCard class="w-fit h-fit text-center m-0.5">
   <h1 class="text-gray-700 dark:text-gray-200 font-sans font-bold" v-if="name">
     {{ name }}
   </h1>
  <slot></slot>
 </UCard>
</template>

<style scoped>

</style>