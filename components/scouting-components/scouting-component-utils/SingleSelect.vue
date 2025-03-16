<script setup lang="ts">
import { computed } from 'vue';
const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  modelValue: string;
  options: Array<string>;
}>();

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

/*
  Array of variants ('solid' meaning selected, 'outline' meaning not selected)
  Used in the UButton HTML to set which button is selected
*/
let variantArray = ref(props.options.map(option => (props.modelValue == option ? 'solid' : 'outline')));

/**
 * Changes the solid button to the selected index
 * @param selectedIndex the index of the button the user selects
 */
function selected(selectedIndex: number) {
  variantArray.value.forEach(
      (element, listIndex) => (variantArray.value[listIndex] = 'outline'),
  );
  value.value = props.options[selectedIndex];
  variantArray.value[selectedIndex] = 'solid';
}
</script>

<template>
  <UButton
    v-for="(item, index) in options"
    class="m-1"
    :label="item"
    :variant="variantArray[index]"
    @click="selected(index)"
  ></UButton>
</template>

<style scoped></style>
