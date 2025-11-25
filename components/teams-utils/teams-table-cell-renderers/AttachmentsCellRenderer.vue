<script setup lang="ts">

import { useRouter } from 'vue-router';

const props = defineProps<{
  params: any // AG Grid passes this automatically
}>();

const router = useRouter();
const teamNumber = String(props.params.data.team_number);

const navigateToTeamAttachments = () => {
  router.push('/teams/attachments/' + teamNumber);
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