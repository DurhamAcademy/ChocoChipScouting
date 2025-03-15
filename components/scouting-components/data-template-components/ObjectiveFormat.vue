<script setup lang="ts">

const props = defineProps<{
  name?: string;
}>();

</script>

<template>
 <div class="w-fit h-fit text-center m-0.5 border border-primary p-2 sm:p-2 rounded-md">
   <h1 class="text-gray-700 dark:text-gray-200 font-sans font-bold" v-if="name">
     {{ name }}
   </h1>
  <slot></slot>
 </div>
</template>

<style scoped>

</style>