<script setup lang="ts">
import {loginStateKey} from "~/utils/keys";
import AddAttachment from "~/components/attachments/AddAttachment.vue";
import SessionResponse = PouchDB.Authentication.SessionResponse;

const {sessionState}: { sessionState: SessionResponse } = inject(loginStateKey)!

let addAttachmentModal = ref(false)

let addButtonLinks = [{
  label: 'Scout Match',
  icon: 'i-heroicons-clipboard-document-list',
  to: '/scout'
}, {
  label: 'Create Note',
  icon: 'i-heroicons-pencil-square',
  to: '/notes/new'
}, {
  label: 'Add Attachment',
  icon: 'i-heroicons-chart-bar',
  click: () => {
    // open()
  }
}]

</script>

<template>
  <navbar></navbar>
  <div>
    <div class="app-button-grid">
      <app-button v-if="sessionState.userCtx.roles?.includes('verified')" text="Matches" to="/matches"/>
      <app-button v-if="sessionState.userCtx.roles?.includes('verified')" text="Teams" to="/teams"/>
      <app-button v-if="sessionState.userCtx.roles?.includes('verified')" text="Notes" to="/notes"/>
      <app-button v-if="sessionState.userCtx.roles?.includes('verified')" text="Competitions" to="/competitions"/>
      <app-button v-if="sessionState.userCtx.roles?.includes('verified')" text="Contacts" to="/contacts"/>
      <app-button v-if="sessionState.userCtx.roles?.includes('admin')" text="Users" to="/users"/>
    </div>
  </div>
  <UContainer class="bottom-0 right-0 fixed p-2">
    <UPopover>
      <UButton :ui="{ rounded: 'rounded-full' }"
               class="m-0 shadow-md"
               color="primary"
               icon="i-heroicons-plus-20-solid"
               size="xl"/>
      <template #panel>
        <UVerticalNavigation :links="addButtonLinks"/>
      </template>
    </UPopover>
  </UContainer>
  <UModal>
    <AddAttachment/>
  </UModal>
</template>

<style scoped>
.app-button-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>