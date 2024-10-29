<script setup lang="ts">
/*
Base page of the website. This really shouldn't be seen during normal use atm.
 */
const colorMode = useColorMode()
console.log(colorMode.preference)

</script>

<template>
  <h1>Please wait!</h1>
  <p>If loading is taking a long time, the server may have a problem.</p>
  <p>If you think there may be an issue with the </p>
  <p>server please find the nearest DARC SIDE programmer.</p>
  <p>Thanks!</p>
  <div>
    <h1>Color mode: {{ $colorMode.value }}</h1>
    <select v-model="$colorMode.preference">
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>qw
      <option value="sepia">Sepia</option>
      <option value="darc">Darc</option>
    </select>
  </div>
</template>


<style scoped></style>

<style>

body {
  background-color: #fff;
  color: rgba(0,0,0,0.8);
}
.dark-mode body {
  background-color: #091a28;
  color: #000000;
}
.sepia-mode body {
  background-color: #f1e7d0;
  color: #433422;
}
.darc-mode body {

  --color: #ebf4f1;
  --color-primary: #41b38a;
  --color-secondary: #fdf9f3;
  --bg: #091a28;
  --bg-secondary: #071521;
  --border-color: #0d2538;

  background-color: #f1e7d0;
  color: #433422;
}
</style>