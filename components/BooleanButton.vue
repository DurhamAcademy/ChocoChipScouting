<script setup lang="ts">
import { computed } from 'vue'
const emit = defineEmits(['update:modelValue'])
const props = defineProps<{
  modelValue: boolean,
  defaultValue: string,
  otherValue: string
}>()

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

function selected(){
  value.value = !value.value
  variantReference.value = bool ? "outline" : "solid"
  labelReference.value = bool ? props.defaultValue : props.otherValue
  bool = !bool
}

/**
 * Probably unnecessary
 */
let bool = props.modelValue

let variantReference = ref(
    props.modelValue ? "solid" : "outline"
)
let labelReference = ref(
    props.modelValue ? props.otherValue : props.defaultValue
)
</script>

<template>
  <UButton @click="selected()" :label="labelReference" :variant="variantReference"></UButton>
</template>

<style scoped>

</style>