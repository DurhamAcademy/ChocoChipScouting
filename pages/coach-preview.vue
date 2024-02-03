<script setup lang="ts">

  let teams = ref([[6502, 700, 12], [7897, 3423, 32]])
  const colorAssignments = ["red", "blue"]

  let friendlyAlliance = true
  let opposingAlliance = true

  function test(){

  }
</script>

<template>
  <OuterComponents>
    <div class="h-12 w-full" style="background-color:green">

    </div>
    <div class="text-center w-full h-full flex flex-col">
        <div v-if="friendlyAlliance" class="flex flex-auto">
          <div v-for="(team) in teams[0]" class="text-blue-500 flex-auto">
            {{team}}
          </div>
        </div>
      <div v-if="opposingAlliance" class="flex flex-auto">
        <div v-for="(team) in teams[1]" class="text-red-500 flex-auto">
          {{team}}
        </div>
      </div>
    </div>
  </OuterComponents>
</template>

<style scoped>
</style>