<script setup lang="ts">
import PouchDB from 'pouchdb';
import { useWindowSize } from '@vueuse/core';
import LoginState from '~/utils/authorization/LoginState';
import { loginStateKey } from '~/utils/keys';
import AddButton from '~/components/website-utils/AddButton.vue';
import type { VerticalNavigationLink } from '#ui/types';
import Navbar from '~/components/website-utils/Navbar.vue';
import type { Ref } from '@vue/reactivity';
import type { UnwrapRef } from 'vue';
import { eventOptions } from '~/utils/eventOptions';
import { useEventKey } from '~/composables/useEventKey';

syncData();

const {
  usernameState,
  sessionState,
  logout,
}: {
  logout: () => Promise<void>;
  // noinspection TypeScriptUnresolvedReference
  loginState: Ref<UnwrapRef<LoginState>>;
  // noinspection TypeScriptUnresolvedReference
  sessionState: Ref<UnwrapRef<PouchDB.Authentication.SessionResponse>>;
  // noinspection TypeScriptUnresolvedReference
  usernameState: Ref<UnwrapRef<string>>;
  updateUsernameState: () => Promise<boolean>;
} = inject(loginStateKey)!;

let { width, height } = useWindowSize();

let router = useRouter();

const events = eventOptions;
const currentEvent = useEventKey();

watch(currentEvent, value => {
  window.localStorage.setItem('currentEvent', value);
  window.dispatchEvent(new Event('event-changed'));
});

let links: VerticalNavigationLink[] = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Matches', to: '/matches' },
  { label: 'Teams', to: '/teams' },
  { label: 'Predict', to: '/predict' },
];
if (
  sessionState.value.userCtx.roles?.indexOf('admin') != -1 ||
  sessionState.value.userCtx.roles?.indexOf('_admin') != -1
) {
  links.push({ label: 'Users', to: '/users' });
}
</script>

<template>
  <div class="flex min-h-screen w-screen flex-col">
    <Navbar class="flex-grow basis-auto" :disable-sidebar="width > 800" />
    <div
      class="flex flex-grow flex-shrink basis-auto flex-row w-screen overflow-x-clip max-h-none place-content-around min-h-full"
    >
      <Transition name="width-fade">
        <div v-show="width > 800" class="vis min-h-screen h-screen max-w-full">
          <UCard class="h-full" :ui="{ rounded: 'rounded-none' }">
            <UVerticalNavigation :links="links" />
            <div class="settingsPopupDiv">
              <div class="flex">
                <UButton
                  v-if="false"
                  icon="i-heroicons-arrow-small-left"
                  color="gray"
                  variant="ghost"
                  block
                  square
                  @click="router.back()"
                />
                <UButton
                  v-if="false"
                  icon="i-heroicons-arrow-small-right"
                  color="gray"
                  variant="ghost"
                  block
                  square
                  @click="router.forward()"
                />
                <UButton
                  v-if="false"
                  icon="i-heroicons-home"
                  color="gray"
                  variant="ghost"
                  block
                  square
                  @click="navigateTo('dashboard')"
                />
              </div>
              <UPopover>
                <UButton
                  icon="i-heroicons-cog-6-tooth"
                  square
                  :size="'xl'"
                  :variant="'ghost'"
                  :color="'gray'"
                />
                <template #panel>
                  <UCard class="p-2">
                    <template #header>
                      <div class="text-center">
                        <span
                          class="overflow-hidden flex-auto text-zinc-900 max-w-32"
                        >
                          {{ usernameState }}
                        </span>
                      </div>
                    </template>
                    <UFormGroup class="inputDiv" label="Event" name="event">
                      <USelectMenu v-model="currentEvent" :options="events" />
                    </UFormGroup>
                    <br />
                    <UButton
                      icon="i-heroicons-arrow-right-circle"
                      trailing
                      color="black"
                      variant="link"
                      label="More Settings"
                      @click="navigateTo('/settings')"
                    />
                    <template #footer>
                      <UButton block label="Logout" square @click="logout" />
                    </template>
                  </UCard>
                </template>
              </UPopover>
            </div>
          </UCard>
        </div>
      </Transition>
      <div
        class="flex-col min-w-0 min-h-full max-h-none max-w-full overflow-x-auto flex-grow"
      >
        <slot />
      </div>
    </div>
  </div>
  <AddButton />
</template>

<style scoped>
.vis {
  width: 20em;
  left: 0;
  position: relative;
}

.settingsPopupDiv {
  position: absolute;
  left: 5.7%;
  bottom: 2.15%;
}
</style>
