<script setup lang="ts">

import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  teamNumber: number
}>();

const router = useRouter();

const teamNumber = String(props.teamNumber);

const navigateToTeamAttachments = () => {
  router.push('/teams/attachments' + teamNumber);
};
</script>

<template>
  <UButton
      size="xs"
      icon="i-heroicons-photo"
      variant="soft"
      @click="navigateToTeamAttachments"
      class="dark:bg-gray-700"
  />
</template>

<style scoped>

</style>