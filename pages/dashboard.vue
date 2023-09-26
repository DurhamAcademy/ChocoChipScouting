<script setup lang="ts">
import {loginStateKey} from "~/utils/keys";
import AddButton from "~/components/AddButton.vue";
import SessionResponse = PouchDB.Authentication.SessionResponse;

const {sessionState}: { sessionState: SessionResponse } = inject(loginStateKey)!

let addAttachmentModal = ref(false)

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
  <AddButton/>
</template>

<style scoped>
.app-button-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>