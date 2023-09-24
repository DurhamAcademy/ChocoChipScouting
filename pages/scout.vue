<script lang="ts" setup>
const items = [
  [{
    label: 'Profile',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/739984?v=4'
    }
  }], [{
    label: 'Edit',
    icon: 'i-heroicons-pencil-square-20-solid',
    shortcuts: ['E'],
    click: () => {
      console.log('Edit')
    }
  }, {
    label: 'Duplicate',
    icon: 'i-heroicons-document-duplicate-20-solid',
    shortcuts: ['D'],
    disabled: true
  }], [{
    label: 'Archive',
    icon: 'i-heroicons-archive-box-20-solid'
  }, {
    label: 'Move',
    icon: 'i-heroicons-arrow-right-circle-20-solid'
  }], [{
    label: 'Delete',
    icon: 'i-heroicons-trash-20-solid',
    shortcuts: ['⌘', 'D']
  }]
]
</script>

<template>
  <Navbar scout-mode></Navbar>
  <UContainer>
    <UButton label="Button"/>
    <UInput name="Input"/>
    <UDropdown :items="items">
      <UButton color="white" label="Options" trailing-icon="i-heroicons-chevron-down-20-solid"/>
    </UDropdown>
    <UCheckbox/>
    <URange/>
  </UContainer>
  <UContainer>
    <UButton label="Cancel" to="/dashboard"/>
  </UContainer>
</template>

<style scoped>

</style>