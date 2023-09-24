<script setup lang="ts">
import LoginState from "~/utils/authorization/LoginState";

var {usernameState, logout}: {
  loginState: LoginState;
  usernameState: string | undefined;
  updateUsernameState: () => Promise<void>;
  logout: () => Promise<void>
} = inject(loginStateKey)!

let route = useRoute()

let props = defineProps({
  scoutMode: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <container class="bg-gray-200 dark:bg-gray-700 w-screen navbar-right sticky top-0 flex flex-row justify-between">
    <div class="flex">
      <UButton v-if="(route.fullPath != '/dashboard') && (!scoutMode)" label="Home" to="/dashboard" variant="ghost"/>
    </div>
    <div class="flex">
      <UPopover>
        <UButton variant="ghost">
          <UAvatar v-if="usernameState!==undefined" :alt="usernameState" :size="scoutMode?'xs':'md'" class="m-1"/>
        </UButton>
        <template #panel>
          <UContainer class="p-2">
            <UButton block label="Logout" square @click="logout"></UButton>
          </UContainer>
        </template>
      </UPopover>
    </div>
  </container>
</template>

<style scoped>
</style>