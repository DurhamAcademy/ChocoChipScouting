<script setup lang="ts">
import LoginState from "~/utils/authorization/LoginState";
import {loginStateKey} from "~/utils/keys";
import SessionResponse = PouchDB.Authentication.SessionResponse;
import {useSelectedEvent} from "~/composables/useSelectedEvent";

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

const events = ['2024test', '2024trial']

let selectedEvent = useSelectedEvent()

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
  { label: "Attachments", to: "/attachments" },
]
console.log(sessionState?.value?.userCtx?.roles)
if (sessionState?.value?.userCtx?.roles?.indexOf('_admin') != -1)
  links.push({ label: "Users", to: "/users" })

</script>

<template>
  <div v-if="!disableSidebar" class="py-2.5 px-5 z-10 bg-opacity-50 bg-gray-200 dark:bg-gray-700 w-screen navbar-right sticky top-0 flex-row justify-between backdrop-blur-lg min-h-16">
      <Transition name="slide-fade">
          <UButton class="slide-nothing" v-if="!disableSidebar" icon="i-heroicons-bars-3-20-solid" variant="ghost" @click="isOpen=!isOpen" :size="'xl'" square style="position:absolute; top:50%; transform: translateY(-50%)"/>
      </Transition>
  </div>
  <USlideover v-model="isOpen" side="left" :appear="!disableSidebar">
    <UCard class="flex flex-col h-screen">
      <template #header>
        <UButton icon="i-heroicons-bars-3-20-solid" variant="ghost" @click="isOpen=!isOpen" :size="'xl'"/>
      </template>
      <UVerticalNavigation :links="links"/>
      <div class="settingsPopupDiv">
        <UPopover>
          <UButton icon="i-heroicons-cog-6-tooth" square :size="'xl'" :variant="'ghost'" :color="'gray'"/>
          <template #panel>
            <UCard class="p-2">
              <template #header>
                <div class="usernameLabel max-w-32 text-zinc-900">
                  {{usernameState}}
                </div>
              </template>
              <UFormGroup class="inputDiv" label="Event" name="event">
                <USelectMenu v-model="selectedEvent" :options="events" @update:model-value ="value => {updateEvent(value)}"/>
              </UFormGroup>
              <template #footer>
                <UButton block label="Logout" square @click="logout"/>
              </template>
            </UCard>
          </template>
        </UPopover>
      </div>
    </UCard>
  </USlideover>
</template>

<style scoped>

.slide-nothing {
  transform: translateX(0%);
}

.usernameLabel{
  overflow:hidden
}

.settingsPopupDiv{
  position:absolute;
  left:4%;
  bottom: 2%
}

</style>