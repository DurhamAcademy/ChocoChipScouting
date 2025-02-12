<script lang="ts" setup>
import { RadarChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'

const props = defineProps<{
  labels: Array<string>
  data: Array<number>
  backgroundColors?: Array<any>
  title: string
}>()

Chart.register(...registerables)
Chart.defaults.scales.radialLinear.min = 0;

let pieChartColors = ['#77CEFF', '#0079AF', '#123E6B', '#97B0C4', '#A5C8ED']
if (props.backgroundColors) pieChartColors = props.backgroundColors

const testData = {
  labels: props.labels,
  datasets: [
    {
      label: props.title,
      fill: true,
      data: props.data,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      pointBackgroundColor: 'rgb(255, 99, 132)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(255, 99, 132)',
      borderWidth: 1,
    },
  ],
  options: {
    scales: {
    }
  },
}
</script>
<template>
  <RadarChart :chartData="testData"/>
</template>