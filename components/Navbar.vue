<script setup lang="ts">
import LoginState from "~/utils/authorization/LoginState";
import {loginStateKey} from "~/utils/keys";
import SessionResponse = PouchDB.Authentication.SessionResponse;

const {usernameState, sessionState, logout}: {
  logout: () => Promise<void>;
  // noinspection TypeScriptUnresolvedReference
  loginState: Ref<UnwrapRef<LoginState>>;
  // noinspection TypeScriptUnresolvedReference
  sessionState: Ref<UnwrapRef<PouchDB.Authentication.SessionResponse>>;
  // noinspection TypeScriptUnresolvedReference
  usernameState: Ref<UnwrapRef<string>>;
  updateUsernameState: () => Promise<boolean>
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
  { label: "Competitions", to: "/competitions" },
  { label: "Attachments", to: "/attachments" },
  { label: "Contacts", to: "/contacts" }
]
console.log(sessionState?.value?.userCtx?.roles)
if (sessionState?.value?.userCtx?.roles?.indexOf('_admin') != -1)
  links.push({ label: "Users", to: "/users" })


</script>

<template>
  <div class="py-2.5 px-5 z-10 bg-opacity-50 bg-gray-200 dark:bg-gray-700 w-screen navbar-right sticky top-0 flex-row justify-between backdrop-blur-lg">
    <div class="flex">
      <Transition name="slide-fade">
        <UButton class="slide-nothing" v-if="!disableSidebar" icon="i-heroicons-bars-3-20-solid" variant="ghost" @click="isOpen=!isOpen" :size="scoutMode?'sm':'xl'" square/>
      </Transition>
      <UPopover style="right: 1%; position: absolute;top: 50%;transform: translateY(-50%);">
        <UButton variant="ghost">
          <UAvatar v-if="usernameState!==undefined" :alt="usernameState" :size="scoutMode?'xs':'md'" class="m-1"/>
        </UButton>
        <template #panel>
          <UCard class="p-2">
            <template #header>
              {{usernameState}}
            </template>

            <UButton block label="Logout" square @click="logout"/>
          </UCard>
        </template>
      </UPopover>
    </div>
  </div>
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