<script setup lang="ts">
import { computed } from 'vue'
const emit = defineEmits(['update:modelValue'])
const props = defineProps<{
  modelValue: Array<String>
}>()
let fullArray = [["f1", "f2", "f3", "f4"],["m1", "m2", "m3", "m4"],["c1", "c2", "c3", "c4"],["s1", "s2", "s3", "s4"]]
    //f = front m = middle c = climb s = speaker
let isOpen = ref(false)

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
  <div>
    <div v-for="items in fullArray" class="flex" flex-auto>
      <div v-for="item in items" @click="isOpen = true" class="flex-auto w-1/4 h-1/4">
        <p>{{item}}</p>
        <br>
      </div>
    </div>
    <UModal v-model="isOpen">
      <div class="flex flex-auto">
        <div class="p-4">
          <div class="h-72">

            </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

<style scoped>

</style>