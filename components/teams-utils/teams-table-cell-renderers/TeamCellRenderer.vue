<script setup lang="ts">

import { useRouter } from 'vue-router';

const props = defineProps<{
  params: any // AG Grid passes this automatically
}>();

const router = useRouter();
const teamNumber = String(props.params.data.team_number);

const navigateToTeam = () => {
  router.push('/teams/' + teamNumber);
};
</script>

<template>
  <UButton
      :label="teamNumber"
      variant="soft"
      size="xs"
      @click="navigateToTeam"
      trailing-icon="i-heroicons-chart-bar-square"
  />
</template>

<style scoped>

</style>