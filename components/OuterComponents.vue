<script setup lang="ts">
import PouchDB from "pouchdb";
import {useWindowSize} from "@vueuse/core";
import LoginState from "~/utils/authorization/LoginState";
import {loginStateKey} from "~/utils/keys";
import AddButton from "~/components/AddButton.vue";
import type {VerticalNavigationLink} from "#ui/types";
import type {Ref} from "@vue/reactivity";
import type {UnwrapRef} from "vue";
import {eventOptions} from "~/utils/eventOptions";

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

const colorMode = useColorMode()
const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})


let {width, height} = useWindowSize()

let route = useRoute()
let router = useRouter()

const events = eventOptions
let selectedEvent = ref(eventOptions[0])
if (typeof window !== 'undefined') selectedEvent.value = localStorage.getItem('currentEvent') || eventOptions[0]

watch(selectedEvent, (value) => {
  window.localStorage.setItem('currentEvent', value)
})

let links: VerticalNavigationLink[] = [
  {label: "Dashboard", to: "/dashboard"},
  {label: "Matches", to: "/matches"},
  {label: "Teams", to: "/teams"},
  { label: "Predict", to: "/predict" },
]
if (sessionState.value.userCtx.roles?.indexOf("admin") != -1 || sessionState.value.userCtx.roles?.indexOf("_admin") != -1) {
  links.push({label: "Users", to: "/users"})
}

</script>

<template>
  <div class="flex min-h-screen w-screen flex-col">
    <Navbar class="flex-grow basis-auto" :disable-sidebar="width > 800"/>
    <div
        class="flex flex-grow flex-shrink basis-auto flex-row w-screen overflow-x-clip max-h-none place-content-around min-h-full">
      <Transition name="width-fade">
        <div v-show="width > 800" class="vis min-h-screen h-screen max-w-full">
          <UCard class="h-full" :ui="{rounded: 'rounded-none'}">
            <UVerticalNavigation :links="links"/>
            <div class="settingsPopupDiv">
              <div class="flex">
                <UButton
                  v-if="false"
                    icon="i-heroicons-arrow-small-left"
                    color="gray"
                    variant="ghost"
                    block
                    square @click="router.back()"
                />
                <UButton
                  v-if="false"
                    icon="i-heroicons-arrow-small-right"
                    color="gray"
                    variant="ghost"
                    block
                    square @click="router.forward()"
                />
              <UButton
                  v-if="false"
                         icon="i-heroicons-home"
                         color="gray" variant="ghost"
                         block square
                         @click="navigateTo('dashboard')"
                />
              </div>
              <UPopover>
                <UButton icon="i-heroicons-cog-6-tooth" square :size="'xl'" :variant="'ghost'" :color="'gray'"/>
                <template #panel>
                  <UCard class="p-2">
                    <template #header>
                        <div class="usernameLabel flex-auto mt-1.5 text-zinc-900 max-w-32">
                          {{ usernameState }}
                        </div>
                    </template>
                    <UFormGroup class="inputDiv" label="Event" name="event">
                      <USelectMenu v-model="selectedEvent" :options="events"/>
                    </UFormGroup>
                    <br>
                    <UFormGroup class="inputDiv" label="Style" name="event">
                      <ClientOnly>
                        <UButton
                          :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
                          color="gray"
                          variant="ghost"
                          label="Theme"
                          @click="isDark = !isDark"
                        />
                      </ClientOnly>
                    </UFormGroup>
                    <template #footer>
                      <UButton block label="Logout" square @click="logout"/>
                    </template>
                  </UCard>
                </template>
              </UPopover>
            </div>
          </UCard>
        </div>
      </Transition>
      <div class="flex-col min-w-0 min-h-full max-h-none max-w-full overflow-x-auto flex-grow place-content-center">
        <slot/>
      </div>
    </div>
  </div>
  <AddButton/>
</template>

<style scoped>

.vis {
  width: 20em;
  left: 0;
  position: relative;
}

.usernameLabel {
  overflow: hidden
}

.settingsPopupDiv {
  position: absolute;
  left: 5.7%;
  bottom: 2.15%
}

</style>