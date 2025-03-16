<script setup lang="ts">

import {defineProps} from "vue";

const props = defineProps<{
  template: ObjectiveTemplate,
  data: ObjectiveTableData,
  missed?: boolean
  label: boolean
}>();

const showMissed = 'missed' in props.template ? props.template.missed : ('missed' in props ? props.missed : false);
const popoverLabel = props.label ? props.template.name + ': ' : ''

</script>

<template>
  <UPopover mode="hover">
    <UButton
        :label="popoverLabel + data.average_count_made"
        variant="soft"
    />
    <template #panel>
      <UCard class="flex">
        <UBadge
            :label="'Made: ' + data.average_count_made"
            variant="soft"
        />
        <UBadge
            v-if="showMissed"
            :label="'Miss: ' + data.average_count_missed"
            variant="soft"
        />
        <UBadge
            v-if="showMissed"
            :label="'Acc: ' + (100 * data.average_count_made/(data.average_count_made + data.average_count_missed)) + '%'"
            variant="soft"
        />
      </UCard>
    </template>
  </UPopover>
</template>

<style scoped>

</style>