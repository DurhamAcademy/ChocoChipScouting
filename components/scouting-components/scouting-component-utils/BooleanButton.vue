<script setup lang="ts">
import { computed } from 'vue';

/** A component for a button that acts like a boolean value switch intended for the scouting page
 *
 * @modelValue the boolean being changed and returned
 * @defaultValue the default label for the button (default is set when you input a model value)
 * @otherValue the not-default label for the button
 */
const props = defineProps<{
  modelValue: boolean;
  defaultValue: string;
  otherValue: string;
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

function selected() {
  value.value = !value.value;
  variantReference.value = bool ? 'outline' : 'solid';
  labelReference.value = bool ? props.defaultValue : props.otherValue;
  bool = !bool;
}

/**
 * Probably unnecessary
 */
let bool = props.modelValue;

let variantReference = ref(props.modelValue ? 'solid' : 'outline');
let labelReference = ref(
  props.modelValue ? props.otherValue : props.defaultValue,
);
</script>

<template>
  <UButton
    @click="selected()"
    :label="labelReference"
    :variant="variantReference"
  ></UButton>
</template>

<style scoped></style>
