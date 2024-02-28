<template>
  <DoughnutChart :chartData="testData" />
</template>

<script lang="ts" setup>
import { DoughnutChart } from 'vue-chart-3';
import { Chart, registerables } from "chart.js";

const props = defineProps<{
  labels: Array<string>,
  data: Array<number>,
  backgroundColors?: Array<any>
}>()

if(registerables) Chart.register(...registerables);

let pieChartColors = ['#77CEFF', '#0079AF', '#123E6B', '#97B0C4', '#A5C8ED']
if(props.backgroundColors)
  pieChartColors = props.backgroundColors


const testData = {
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: pieChartColors,
    },
  ],
};
</script>