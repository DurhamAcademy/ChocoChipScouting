<script setup lang="ts">
  import {useWindowSize} from "@vueuse/core";
  import LoginState from "~/utils/authorization/LoginState";
  import {loginStateKey} from "~/utils/keys";
  import AddButton from "~/components/AddButton.vue";
  import SessionResponse = PouchDB.Authentication.SessionResponse;

  const {loginState,usernameState, sessionState, logout}: {
    logout: () => Promise<void>;
    loginState: Ref<UnwrapRef<LoginState>>;
    sessionState: Ref<UnwrapRef<PouchDB.Authentication.SessionResponse>>;
    usernameState: Ref<UnwrapRef<string>>;
    updateUsernameState: () => Promise<boolean>
  } = inject(loginStateKey)!

  var {width, height} = useWindowSize()
  let isOpen = ref(false)

  let route = useRoute()

  let links: VerticalNavigationLink[] = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Matches", to: "/matches" },
    { label: "Teams", to: "/teams" },
    { label: "Competitions", to: "/competitions" },
    { label: "Attachments", to: "/attachments" },
    { label: "Contacts", to: "/contacts" }
  ]
  if (sessionState?.value?.userCtx?.roles?.indexOf('_admin') != -1)
    links.push({ label: "Users", to: "/users" })

</script>

<template>
  <div class="min-h-screen flex-col">
    <Navbar :disable-sidebar="width > 800"/>
    <div class="flex place-content-around min-h-full">
      <Transition name="width-fade">
        <div v-show="width > 800" class="vis min-h-full">
          <UCard class="h-full" :ui="{rounded: 'rounded-none'}">
            <UVerticalNavigation :links="links"/>
          </UCard>
        </div>
      </Transition>
      <div class="flex-col flex-grow place-content-center">
        <slot/>
      </div>
    </div>
  </div>
  <AddButton/>
</template>

<style scoped>
/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.width-fade-enter-active,
.width-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.width-fade-enter-from,
.width-fade-leave-to {
  width: 0em !important;
  opacity: 0;
}

.vis {
  width: 20em;
  left: 0em;
  position:relative;
}
</style>