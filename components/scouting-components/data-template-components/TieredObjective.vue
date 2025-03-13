<script setup lang="ts">

import SingleSelect from "~/components/scouting-components/SingleSelect.vue";
import IncrementalButton from "~/components/scouting-components/IncrementalButton.vue";


</script>

<template>
  <div class="w-fit text-center ml-4">
    <h1
        class="text-gray-700 dark:text-gray-200 font-sans font-bold"
    >
      Coral
    </h1>
    <div class="flex flex-auto justify-center max-w-44">
      <div class="flex-auto text-center mr-2">
        <h1
            class="text-coral-400 font-sans mt-1 font-light text-sm"
        >
          Missed
        </h1>
        <IncrementalButton
            class="my-1"
            v-model="scoutData.auto.coralL1Miss"
            v-if="coralLevel == 0"
        ></IncrementalButton>
        <IncrementalButton
            class="my-1"
            v-model="scoutData.auto.coralL2Miss"
            v-else-if="coralLevel == 1"
        ></IncrementalButton>
        <IncrementalButton
            class="my-1"
            v-model="scoutData.auto.coralL3Miss"
            v-else-if="coralLevel == 2"
        ></IncrementalButton>
        <IncrementalButton
            class="my-1"
            v-model="scoutData.auto.coralL4Miss"
            v-else
        ></IncrementalButton>
      </div>
      <div class="flex-auto text-center">
        <h1
            class="text-coral-400 font-sans mt-1 font-light text-sm"
        >
          Scored
        </h1>
        <IncrementalButton
            class="my-1"
            v-model="scoutData.auto.coralL1"
            v-if="coralLevel == 0"
        ></IncrementalButton>
        <IncrementalButton
            class="my-1"
            v-model="scoutData.auto.coralL2"
            v-else-if="coralLevel == 1"
        ></IncrementalButton>
        <IncrementalButton
            class="my-1"
            v-model="scoutData.auto.coralL3"
            v-else-if="coralLevel == 2"
        ></IncrementalButton>
        <IncrementalButton
            class="my-1"
            v-model="scoutData.auto.coralL4"
            v-else
        ></IncrementalButton>
      </div>
    </div>
    <div class="ml-0.5">
      <SingleSelect
          v-model="coralLevel"
          :options="['L1', 'L2', 'L3', 'L4']"
      />
    </div>
  </div>
</template>

<style scoped>

</style>