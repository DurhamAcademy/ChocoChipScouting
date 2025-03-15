<script setup lang="ts">
import { computed } from 'vue'

const emit = defineEmits(['update:modelValue'])
/*
Model Value: Array of bools => true is selected, false is not selected
Options: Array of strings => the button labels/options to be picked
Connected Options: Array of numbers => length matches the amount of buttons,
 if two buttons have the same number in this array they can be selected at the same time
 */
const props = defineProps<{
    modelValue: SpecialObjectiveOptionData[]
    options: string[]
    connectedOptions?: number[]
}>()

const value = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    },
})

let variantArray = ref(value.value.map(option => option.selected ? 'solid' : 'outline'))

// setting first option as true
value.value[0].selected = true
variantArray.value[0] = 'solid'


function selected(index: number) {
    let currentVariant = variantArray.value[index]
    variantArray.value.forEach((element, listIndex) => {
        if (props.connectedOptions && props.connectedOptions[index] != props.connectedOptions[listIndex]) {
            variantArray.value[listIndex] = 'outline'
            value.value[listIndex].selected = false;
        }
    })
    variantArray.value[index] = currentVariant == 'solid' ? 'outline' : 'solid'
    value.value[index].selected = !value.value[index].selected

    // if none of the buttons are selected, then the first option (assumed to be default) is selected
    if (!value.value.map(option => option.selected).some(element => element)) {
      value.value[0].selected = true
      variantArray.value[0] = 'solid'
    }
}
</script>

<template>
    <UButton
        v-for="(item, index) in options"
        class="m-1"
        :label="item"
        :variant="variantArray[index]"
        @click="selected(index)"
    />
</template>

<style scoped></style>
