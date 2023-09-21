<script setup lang="ts">
  import Userfront, { SignupForm } from "@userfront/vue";

  const props = defineProps({value: String});
  Userfront.init("demo1234");
</script>

<template>
  <SignupForm tool-id="nkmbbm"></SignupForm>
</template>

<style scoped>
</style>