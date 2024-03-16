<script setup lang="ts">

import SyncStatusVisualization from "~/components/SyncStatusVisualization.vue";
</script>

<template>
  <OuterComponents>
    <div class="flex justify-center">
      <UCard class="max-w-xl mt-5 flex-grow">
        <UAccordion
            variant="soft"
            size="sm"
            :items="[{ label: 'Debug Menu', slot: 'debug'}]"
        >
          <template #debug>
            <SyncStatusVisualization/>
          </template>
        </UAccordion>
      </UCard>
    </div>
  </OuterComponents>
</template>

<style scoped>

</style>