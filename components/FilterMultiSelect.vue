<script setup lang="ts">
import { computed } from 'vue'
const emit = defineEmits(['update:modelValue'])
/*
  Model Value => The selected filters, each containing an id, their content, and optionally if they are user created
  Options => Pre-programmed filter options, each with an id and content
  Extra options => Guidelines for user creation of filters. Array of strings. Becomes a button with extraOption ': ' user input
  Search Placeholder => placeholder for search (user input). defaults to "Search or Add Filter"
  Filter Placeholder => placeholder for filter (dropdown button). defaults to "Edit Filters"
 */
const props = defineProps<{
  modelValue: Array<{ id: number, content: string, custom?: boolean}>,
  options: Array<{ id: number, content: string, custom?: boolean}>,
  extraOptions?: Array<string>
  searchPlaceholder?: string,
  filterPlaceholder?: string,
}>()

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    for(let option of props.options){
      let optionSelected = false
      for(let selectedOption of value){
        if(option.id == selectedOption.id)
          optionSelected = true
      }
      if(!optionSelected && option.custom != undefined && option.custom){
        props.options.splice(props.options.indexOf(option, 1))
      }
    }
    emit('update:modelValue', value)
  }
})


let dropdownVariants = ref<Array<string>>()
if(props.extraOptions) {
  dropdownVariants = ref(Array(props.extraOptions.length)
      .fill("")
      .map(
          () => "ghost"
      ))
}

function addFilter(filterOption: string, index: number, query: string){
  props.options.push({ id: props.options.length + 1, content: filterOption + ': ' +  query, custom: true})
}

</script>

<template>
    <USelectMenu
        v-model="value"
        by="id"
        :options="options"
        option-attribute="content"
        multiple
        searchable
        :searchable-placeholder="searchPlaceholder != undefined ? searchPlaceholder: 'Search or Add Filter'"
    >
      <template #default>
        <UButton color="gray" class="flex-1 justify-between min-h-9">
          <span class="text-slate-600" v-if="value.length == 0">{{filterPlaceholder != undefined ? filterPlaceholder: 'Edit Filters'}}</span>
          <div>
            <UBadge class="mr-1 pl-2.5 pr-2.5" v-for="filter in value" :label="filter.content" color="white" :ui="{ rounded: 'rounded-full' }"></UBadge>
          </div>
          <UIcon name="i-heroicons-adjustments-horizontal" class="w-5 h-5 transition-transform text-gray-400 dark:text-gray-500" :class="[open && 'transform rotate-90']" />
        </UButton>
      </template>
      <template #option-empty="{ query }" class="w-full">
        <UButton v-for="(option, index) in props.extraOptions" :label="'add \'' + option + ': ' + query + '\''" :variant="dropdownVariants[index]" color="gray" @mouseover="dropdownVariants[index] = 'soft'" @mouseleave="dropdownVariants[index] = 'ghost'" @click="addFilter(option, index, query)"></UButton>
      </template>
    </USelectMenu>
</template>

<style scoped>

</style>