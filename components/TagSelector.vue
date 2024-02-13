<script setup lang="ts">
import { computed } from 'vue'
const emit = defineEmits(['update:modelValue'])
const props = defineProps<{
  modelValue: Array<string>,
  options: Array<string>,
}>()

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
            (_, index) => value.value.includes(props.options[index]) ? "solid" : "ghost"
        )
)

function selected(index:number, tag:string){
  let currentVariant = variantArray.value[index]
  let updatedValue = value.value
  if(currentVariant == "solid")
    updatedValue.splice(value.value.indexOf(tag))
  else {
    updatedValue.push(tag)
  }
  variantArray.value[index] = currentVariant == "solid" ? "ghost" : "solid"
  value.value = updatedValue
}

</script>

<template>
  <UPopover>
    <UButton label="+ Add Tags" variant="ghost"/>
    <template #panel>
      <div class="flex-wrap flex max-w-64 justify-center">
        <UButton v-for="(item, index) in options" :label="item" style="margin:5px" :variant="variantArray[index]" :ui="{ rounded: 'rounded-full' }" @click="selected(index, item)" class="flex-grow justify-center"/>
      </div>
    </template>
  </UPopover>
</template>

<style scoped>

</style>