<script setup lang="ts">

import {computed} from "vue";
const emit = defineEmits(['update:modelValue'])

const props = defineProps<{
  modelValue: Array<boolean & number & Array<string>>,
  questions: Array<string>,
}>()

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
  <div class="flex select-none">
    <UTooltip :text="modelValue[0] ? 'Sumbmitting': 'Not Submitting'">
      <UToggle class="flex-0 mr-3 mt-0.5" v-model="modelValue[0]"/>
    </UTooltip>
    <URange class="flex-auto mt-1 ml-1" :disabled="!modelValue[0]" :min="1" :max="5" v-model="modelValue[1]"></URange>
    <UBadge class="flex-auto ml-3 select-none" :label="modelValue[1]" :variant="!modelValue[0] ? 'outline': 'solid'"></UBadge>
  </div>
  <UTextarea class="mt-3 w-full" v-for="(item, index) in questions" v-model="modelValue[2][index]" :disabled="!modelValue[0]" :rows="1" autoresize :placeholder="item"/>
</template>

<style scoped>

</style>