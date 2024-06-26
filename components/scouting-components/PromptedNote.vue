<script setup lang="ts">
import { computed } from 'vue';
const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
  modelValue: { selected: boolean; rating: number; notes: Array<string> };
  questions: Array<any>;
}>();

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});
</script>

<template>
  <div class="flex select-none">
    <UTooltip :text="modelValue.selected ? 'Sumbmitting' : 'Not Submitting'">
      <UToggle class="flex-0 mr-3 mt-0.5" v-model="modelValue.selected" />
    </UTooltip>
    <URange
      class="flex-auto mt-1 ml-1"
      :disabled="!modelValue.selected"
      :min="1"
      :max="5"
      v-model="modelValue.rating"
    ></URange>
    <UBadge
      class="flex-auto ml-3 select-none"
      :label="modelValue.rating"
      :variant="!modelValue.selected ? 'outline' : 'solid'"
    ></UBadge>
  </div>
  <UTextarea
    class="mt-3 w-full"
    v-for="(item, index) in questions"
    v-model="modelValue.notes[index]"
    :disabled="!modelValue.selected"
    :rows="item[1]"
    autoresize
    :placeholder="item[0]"
  />
</template>

<style scoped></style>
