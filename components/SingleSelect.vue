<script setup lang="ts">
import { computed } from 'vue'
const emit = defineEmits(['update:modelValue'])

const props = defineProps<{
  modelValue: number,
  options: Array<String>
}>()

function currentlySelected(index:number){
  console.log(index)
  value.value = index
}

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

</script>

<template>
  <UButton v-for="(item, index) in options" class="m-1" :label=item @click="currentlySelected(index)"></UButton>
</template>

<style scoped>

</style>