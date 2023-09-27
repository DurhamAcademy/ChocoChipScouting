<script setup lang="ts">
import {loginStateKey} from "~/utils/keys";
import AddButton from "~/components/AddButton.vue";
import SessionResponse = PouchDB.Authentication.SessionResponse;

const {sessionState}: { sessionState: SessionResponse } = inject(loginStateKey)!

let addAttachmentModal = ref(false)

</script>

<template>
  <Navbar></Navbar>
  <div class="px-5">
    <USkeleton class="w-full h-64 my-5"></USkeleton>
    <UCard class="my-5">
      <div class="m-1 flex flex-wrap">
        <div class="w-1/2 pr-2.5">
          <USkeleton class="w-full h-32"></USkeleton>
        </div>
        <div class="w-1/2 pl-2.5">
          <USkeleton class="w-full h-32"></USkeleton>
        </div>
        <div class="w-full py-2.5">
          <USkeleton class="w-full h-16"></USkeleton>
        </div>
      </div>
    </UCard>
    <USkeleton class="w-full h-32 my-5"></USkeleton>
    <UCard class="my-5">
      <div class="m-1 flex items-center space-x-4">
        <USkeleton class="h-12 w-12" :ui="{ rounded: 'rounded-full' }" />
        <div class="space-y-2 flex-grow">
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-full" />
        </div>
      </div>
    </UCard>

<!--    <div class="app-button-grid">-->
<!--      <app-button v-if="sessionState.userCtx.roles?.includes('verified')" text="Matches" to="/matches"/>-->
<!--      <app-button v-if="sessionState.userCtx.roles?.includes('verified')" text="Teams" to="/teams"/>-->
<!--      <app-button v-if="sessionState.userCtx.roles?.includes('verified')" text="Notes" to="/notes"/>-->
<!--      <app-button v-if="sessionState.userCtx.roles?.includes('verified')" text="Competitions" to="/competitions"/>-->
<!--      <app-button v-if="sessionState.userCtx.roles?.includes('verified')" text="Attachments" to="/attachments"/>-->
<!--      <app-button v-if="sessionState.userCtx.roles?.includes('verified')" text="Contacts" to="/contacts"/>-->
<!--      <app-button v-if="sessionState.userCtx.roles?.includes('admin')" text="Users" to="/users"/>-->
<!--    </div>-->
  </div>
  <AddButton/>
</template>

<style scoped>
.app-button-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>