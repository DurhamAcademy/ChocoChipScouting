<script setup lang="ts">
import { computed } from 'vue'
const emit = defineEmits(['update:modelValue'])
/*
Model Value: Array of numbers => 1 is selected, 0 is not selected
Options: Array of strings => the labels for the buttons
Connected Options: Array of numbers => matches the amount of buttons,
 if two buttons have the same number in this array they can be selected at the same time
 */
const props = defineProps<{
    modelValue: Array<number>
    options: Array<String>
    connectedOptions?: Array<number>
}>()

const value = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    },
})

function selected(index: number) {
    let currentVariant = variantArray.value[index]
    variantArray.value.forEach((element, listIndex) => {
        if (props.connectedOptions != undefined && props.connectedOptions[index] != props.connectedOptions[listIndex]) {
            variantArray.value[listIndex] = 'outline'
            let uv = value.value
            uv[listIndex] = 0
            value.value = uv
        }
    })
    variantArray.value[index] = currentVariant == 'solid' ? 'outline' : 'solid'
    let updatedValue = value.value
    updatedValue[index] = value.value[index] == 0 ? 1 : 0
    value.value = updatedValue
}

let variantArray = ref(
    Array(props.options.length)
        .fill('')
        .map((_, index) => (props.modelValue[index] == 1 ? 'solid' : 'outline'))
)
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
