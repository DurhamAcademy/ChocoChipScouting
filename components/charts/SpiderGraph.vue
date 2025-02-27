<script lang="ts" setup>
import { RadarChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';

const props = defineProps<{
  labels: Array<string>;
  data: Array<number>;
  title: string;
  min: string;
  max: string;
  height?: string;
  width?: string;
  missing: boolean;
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
Chart.defaults.scales.radialLinear.ticks.stepSize = 20; //this may need to be a variable in the future
//Chart.defaults.scales.radialLinear.pointLabels.color = 'rgb(255, 99, 132)';
Chart.defaults.scales.radialLinear.ticks.color = 'rgb(255, 99, 132)';
Chart.defaults.scales.radialLinear.ticks.showLabelBackdrop = false;


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
      stepSize: 20,
    },
  ],
};
</script>
<template>
  <div class="max-h-96">
    <RadarChart
      :chartData="testData"
      :class="height + ' relative ' + width"
    />
    <p class="dark:text-coral-400" v-if="props.missing">*There may be missing data</p>
  </div>
</template>
