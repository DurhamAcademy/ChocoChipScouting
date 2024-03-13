<template>
  <div :class="height + ' relative ' + width">
    <BarChart :chartData="data" :options="options"/>
  </div>
</template>

<script lang="ts" setup>
import { BarChart } from 'vue-chart-3';
import { Chart, registerables } from "chart.js";

const props = defineProps<{
  labels: Array<string>,
  data: Array<number>,
  chartTitle?: string
  backgroundColors?: Array<any>,
  borderColors?: Array<any>
  suggestedMax?: number,
  height?: string,
  width?: string
}>()

watch(props, () => {
  data.value.datasets[0].data = props.data
  data.value.labels = props.labels
  if(props.chartTitle) data.value.datasets[0].label = props.chartTitle
}, {
  deep: true
})

let backgroundColors = [
  'rgba(255, 99, 132, 0.2)',
  'rgba(255, 159, 64, 0.2)',
  'rgba(255, 205, 86, 0.2)',
  'rgba(75, 192, 192, 0.2)',
  'rgba(54, 162, 235, 0.2)',
  'rgba(153, 102, 255, 0.2)',
  'rgba(201, 203, 207, 0.2)'
]

if(props.backgroundColors)
  backgroundColors = props.backgroundColors

let borderColors = [
  'rgb(255, 99, 132)',
  'rgb(255, 159, 64)',
  'rgb(255, 205, 86)',
  'rgb(75, 192, 192)',
  'rgb(54, 162, 235)',
  'rgb(153, 102, 255)',
  'rgb(201, 203, 207)'
]
if(props.borderColors)
  borderColors = props.borderColors

if(registerables) Chart.register(...registerables);

let options = {
  scales: {
    y: {
      suggestedMax: props.suggestedMax || 10,
    }
  },
  responsive: true
}

const data = ref({
  labels: props.labels,
  datasets: [{
    label: props.chartTitle || "",
    data: props.data,
    backgroundColor: backgroundColors,
    borderColor: borderColors,
    borderWidth: 1
  }]
});
</script>