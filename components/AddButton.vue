<script setup>
let addButtonLinks = [{
  label: 'Scout Match',
  icon: 'i-heroicons-clipboard-document-list',
  to: '/scout'
}, {
  label: 'Create Note',
  icon: 'i-heroicons-pencil-square',
  to: '/notes'
}]
/*
, {
  label: 'Add Attachment',
  icon: 'i-heroicons-chart-bar',
  to: '/attachment/add'
}
 */
</script>

<template>
  <UContainer class="bottom-0 right-0 fixed p-2">
    <UPopover>
      <UButton :ui="{ rounded: 'rounded-full' }"
               class="m-0 shadow-md"
               color="primary"
               icon="i-heroicons-plus-20-solid"
               size="xl"/>
      <template #panel>
        <UVerticalNavigation :links="addButtonLinks"/>
      </template>
    </UPopover>
  </UContainer>
</template>