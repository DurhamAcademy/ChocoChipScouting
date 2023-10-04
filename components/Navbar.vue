<script setup lang="ts">
import LoginState from "~/utils/authorization/LoginState";
import {VerticalNavigationLink} from "@nuxt/ui/dist/runtime/types";
import {loginStateKey} from "~/utils/keys";
import SessionResponse = PouchDB.Authentication.SessionResponse;

const {usernameState, sessionState, logout}: {
  loginState: LoginState;
  sessionState: SessionResponse,
  usernameState: string | undefined;
  updateUsernameState: () => Promise<void>;
  logout: () => Promise<void>
} = inject(loginStateKey)!

let props = defineProps({
  scoutMode: {
    type: Boolean,
    default: false
  },
  disableSidebar: {
    type: Boolean,
    default: false
  }
})

let route = useRoute()

let isOpen = ref(false)

let links: VerticalNavigationLink[] = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Matches", to: "/matches" },
  { label: "Teams", to: "/teams" },
  { label: "Notes", to: "/notes" },
  { label: "Competitions", to: "/competitions" },
  { label: "Attachments", to: "/attachments" },
  { label: "Contacts", to: "/contacts" }
]
if (sessionState.userCtx?.roles?.includes('_admin'))
  links.push({ label: "Users", to: "/users" })


</script>

<template>
  <container class="py-2.5 px-5 z-10 bg-opacity-50 bg-gray-200 dark:bg-gray-700 w-screen navbar-right sticky top-0 flex flex-row justify-between backdrop-blur-lg">
    <div class="flex">
      <Transition name="slide-fade">
        <UButton class="slide-nothing" v-if="!disableSidebar" icon="i-heroicons-bars-3-20-solid" variant="ghost" @click="isOpen=!isOpen" :size="scoutMode?'sm':'xl'" square/>
      </Transition>
    </div>
    <div class="flex">
      <UPopover >
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
  <USlideover v-model="isOpen" side="left" :appear="!disableSidebar">
    <UCard class="flex flex-col h-screen">
      <template #header>
        <UButton icon="i-heroicons-bars-3-20-solid" variant="ghost" @click="isOpen=!isOpen" :size="scoutMode?'sm':'xl'"/>
      </template>
      <UVerticalNavigation :links="links"/>
    </UCard>
  </USlideover>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-100%) !important;
  opacity: .5;
}

.slide-nothing {
  transform: translateX(0%);
}
</style>