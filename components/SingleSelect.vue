<script setup lang="ts">
import { computed } from 'vue'
const emit = defineEmits(['update:modelValue'])
const props = defineProps<{
  modelValue: number,
  options: Array<String>
}>()

/**
 * Changes the solid button to the selected index
 * @param selectedIndex the index of the button the user selects
 */
function selected(selectedIndex:number){
  variantArray.value.forEach(
      (element, listIndex) => variantArray.value[listIndex] = "outline"
  )
  value.value = selectedIndex
  variantArray.value[selectedIndex] = "solid"
}

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

let variantArray = ref(
    Array(props.options.length)
        .fill("")
        .map(
            (_, index) => props.modelValue == index ? "solid" : "outline"
        )
)


</script>

<template>
  <UButton v-for="(item, index) in options" class="m-1" :label=item :variant="variantArray[index]" @click="selected(index)"></UButton>
</template>

<style scoped>

</style>