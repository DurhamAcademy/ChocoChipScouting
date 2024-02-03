<script setup lang="ts">
  import {useWindowSize} from "@vueuse/core";
  import LoginState from "~/utils/authorization/LoginState";
  import {loginStateKey} from "~/utils/keys";
  import AddButton from "~/components/AddButton.vue";
  import type {VerticalNavigationLink} from "#ui/types";
  import type {Ref} from "@vue/reactivity";
  import type {UnwrapRef} from "vue";
  import {couchDBBaseURL} from "~/utils/URIs";

  const usersDB = new PouchDB(`${couchDBBaseURL}/_users`, {skip_setup: true});
  const session = await usersDB.getSession()

  let {width, height} = useWindowSize()

  let route = useRoute()

  const events = ['2024test', '2024trial']

  let selectedEvent = ref(window.localStorage.getItem("event"))

  function updateEvent(value: string){
    window.localStorage.setItem("event", value)
  }

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

  let links: VerticalNavigationLink[] = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Matches", to: "/matches" },
    { label: "Teams", to: "/teams" },
    { label: "Attachments", to: "/attachments" }
  ]
  if (session.userCtx.roles?.indexOf("_admin") != -1){
    links.push({ label: "Users", to: "/users" })
  }

</script>

<template>
  <div class="flex min-h-screen w-screen flex-col">
    <Navbar class="flex-grow basis-auto" :disable-sidebar="width > 800"/>
    <div class="flex flex-grow flex-shrink basis-auto flex-row w-screen overflow-x-clip max-h-none place-content-around min-h-full">
      <Transition name="width-fade">
        <div v-show="width > 800" class="vis min-h-screen h-screen max-w-full">
          <UCard class="h-full" :ui="{rounded: 'rounded-none'}">
            <UVerticalNavigation :links="links"/>
            <div style="position:absolute; left:5.7%; bottom: 2.15%">
              <UPopover>
              <UButton icon="i-heroicons-cog-6-tooth" square :size="'xl'" :variant="'ghost'" :color="'gray'"/>
                  <template #panel>
                    <UCard class="p-2">
                      <template #header>
                        <div class="max-w-32" style="color:black; overflow:hidden">
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
  position:relative;
}

.usernameLabel{
  overflow:hidden
}

.settingsPopupDiv{
  position:absolute;
  left:5.7%;
  bottom: 2.15%
}

</style>