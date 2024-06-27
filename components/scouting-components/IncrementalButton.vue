<script setup lang="ts">
import { computed } from 'vue';
/**
 A component for an incremental button intended for the scouting page
 looks like:
 - 0 + => - 1 + => - 2 + => etc
 and returns the number in the middle

@modelValue: the number being changed and returned as the input value
@maxValue: the maximum value possible, defaults to infinity
@minValue: the minimum value possible, defaults to 0
 */
const props = defineProps<{
  modelValue: number;
  maxValue?: number;
  minValue?: number;
}>();
const emit = defineEmits(['update:modelValue']);

/**
 * Getter and setter for the modelValue
 */
const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

/**
 * Function addToValue()
 * adds one to the value of the component
 */
function addToValue() {
  if (props.maxValue == undefined) value.value++;
  else if (value.value < props.maxValue) value.value++;
}

/**
 * Function subtractFromValue()
 * subtracts one from the value of the component such that the value cannot go below zero
 */
function subtractFromValue() {
  let limitValue = props.minValue != undefined ? props.minValue : 0;
  if (value.value > limitValue) value.value--;
}
</script>

<template>
  <UButtonGroup
    size="sm"
    orientation="horizontal"
    class="mb-2.5"
  >
    <UButton
      color="primary"
      variant="solid"
      @click="subtractFromValue()"
      >-</UButton
    >
    <UButton
      disabled
      color="primary"
      variant="solid"
      :label="value.toString()"
    ></UButton>
    <UButton
      color="primary"
      variant="solid"
      @click="addToValue()"
      >+</UButton
    >
  </UButtonGroup>
</template>

<style scoped></style>
