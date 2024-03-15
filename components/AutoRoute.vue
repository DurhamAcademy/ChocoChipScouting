<script setup lang="ts">
const emit = defineEmits(['update:result'])
const props = defineProps<{
}>()
let
    index: string,
    fullArray: [["f1", "f2", "f3", "f4"],["m1", "m2", "m3", "m4"],["c1", "c2", "c3", "c4"],["s1", "s2", "s3", "s4"]],
    //f = front m = middle c = climb s = speaker
    result: string[]
</script>

<template>
  <div>
    <div v-for="items in fullArray">
      <p>{{items}}</p>
      <p>Hey</p>
      <div v-for="item in items">
        <p>{{item}}</p>
        <p> HEy</p>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>