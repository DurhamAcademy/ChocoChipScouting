<script setup lang="ts">
import { LineChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'

const props = defineProps<{
    labels: Array<string>
    data: Array<Array<number>>
    chartTitles?: Array<string>
    suggestedMax?: number
    defaultShown?: Array<boolean>
    width?: any
    height?: any
}>()

if (registerables) Chart.register(...registerables)

let shownLines = []
if (props.defaultShown == undefined) {
    shownLines = props.data.map(() => {
        true
    })
} else shownLines = props.defaultShown

let borderColors = [
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
    'rgb(54, 162, 235)',
    'rgb(153, 102, 255)',
    'rgb(201, 203, 207)',
]

const data = ref({
    labels: props.labels,
    datasets: <any>[],
})

for (let i = 0; i < props.data.length; i++) {
    if (props.chartTitles != undefined) {
        data.value.datasets.push({
            label: props.chartTitles[i] || '',
            data: props.data[i],
            fill: false,
            tension: 0.1,
            borderColor: borderColors[i],
            showLine: shownLines[i],
        })
    } else {
        data.value.datasets.push({
            data: props.data[i],
            fill: false,
            tension: 0.1,
            borderColor: borderColors[i],
            showLine: shownLines[i],
        })
    }
}

let options = {
    scales: {
        y: {
            suggestedMax: props.suggestedMax || 10,
            suggestedMin: 0,
        },
    },
    responsive: true,
}
</script>

<template>
    <div :class="'relative ' + height + ' ' + width">
        <LineChart :chart-data="data" :options="options" :width="'300px'" :height="'300px'"></LineChart>
    </div>
</template>
