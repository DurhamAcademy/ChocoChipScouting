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
function currentlySelected(selectedIndex:number){
  variantCheckList.value.forEach(
      (element, listIndex) => variantCheckList.value[listIndex] = "outline"
  )
  value.value = selectedIndex
  variantCheckList.value[selectedIndex] = "solid"
}

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

let variantCheckList = ref(
    Array(props.options.length)
        .fill("")
        .map(
            (_, index) => props.modelValue == index ? "solid" : "outline"
        )
)


</script>

<template>
  <UButton v-for="(item, index) in options" class="m-1" :label=item :variant="variantCheckList[index]" @click="currentlySelected(index)"></UButton>
</template>

<style scoped>

</style>