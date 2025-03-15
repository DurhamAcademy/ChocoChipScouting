<script setup lang="ts">
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  teamNumber: TeamTableDataTest.team_number
});

const router = useRouter();
const teamNumber = String(props.params)

const navigateToTeam = () => {
  router.push('/teams/' + teamNumber);
};
</script>

<template>
  <UButton
      :label="teamNumber"
      variant="soft"
      :color="params."
      size="xs"
      @click="navigateToTeam"
      trailing-icon="i-heroicons-chart-bar-square"
      class="dark:border-gray-700"
  />
</template>

<style scoped>

</style>