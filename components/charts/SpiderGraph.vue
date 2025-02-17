<script lang="ts" setup>
import { RadarChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';

const props = defineProps<{
  labels: Array<string>;
  data: Array<number>;
  title: string;
  min: string;
  max: string;
}>();

Chart.register(...registerables);

//sets max and min (if specified)
if (props.min != null) {
  Chart.defaults.scales.radialLinear.min = parseInt(props.min);
}
if (props.max != null) {
  Chart.defaults.scales.radialLinear.max = Math.round(parseInt(props.max));
  //this was made due to the existence of a ton of zeroes but may need to be changed
  //in the future if we make these with decimal maxes but it works for now
}

//sets up the data for the spider graph
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
};
</script>
<template>
  <RadarChart :chartData="testData" />
</template>