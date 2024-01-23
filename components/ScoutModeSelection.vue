<script setup lang="ts">
const props = defineProps<{
  options: Array<number>
}>()

/*
[15], [105], [30]
 */

const autoWidthCalc = computed(() => {
  return (props.options[0] / (props.options[0] + props.options[1] + props.options[2])) * 100
})
const teleWidthCalc = computed(() => {
  console.log((props.options[0] + props.options[1] + props.options[2]) / props.options[1])
  return props.options[1] / (props.options[0] + props.options[1] + props.options[2]) * 100
})
const endWidthCalc = computed(() => {
  return  props.options[2] / (props.options[0] + props.options[1] + props.options[2]) * 100
})

</script>

<template>
  <UButtonGroup :style="{paddingBottom: '4px'}" orientation="horizontal" class="w-full">
    <UButton :style="{display: 'inline-block', width: autoWidthCalc + '%'}">Auto</UButton>
    <UButton :style="{display: 'inline-block', width: teleWidthCalc + '%'}">TeleOp</UButton>
    <UButton :style="{display: 'inline-block', width: endWidthCalc + '%'}">Endgame</UButton>
    <UButton :style="{display: 'inline-block', width: endWidthCalc + '%'}">Notes</UButton>
  </UButtonGroup>
  <UProgress :value="75"/>
</template>

<style scoped>

</style>