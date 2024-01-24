<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  modelValue: number,
  maxValue?: number,
}>()
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

/**
 * Function addToValue()
 * adds one to the value of the component
 */
function addToValue(){
  if(props.maxValue == undefined)
    value.value++
  else if(value.value < props.maxValue)
    value.value++
}

/**
 * Function subtractFromValue()
 * subtracts one from the value of the component such that the value cannot go below zero
 */
function subtractFromValue(){
  if(value.value > 0)
    value.value--
}

</script>

<template>
  <UButtonGroup size="sm" orientation="horizontal" class="mb-2.5">
    <UButton color="primary" variant="solid" @click="subtractFromValue()">-</UButton>
    <UButton disabled color="primary" variant="solid" :label="value.toString()" ></UButton>
    <UButton color="primary" variant="solid" @click="addToValue()">+</UButton>
  </UButtonGroup>
</template>

<style scoped>

</style>