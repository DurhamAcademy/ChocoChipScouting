<script setup lang="ts">

</script>

<template>
  <navbar></navbar>
  <div>
    <div class="app-button-grid">
      <app-button to="/matches" text="Matches"/>
      <app-button to="/teams" text="Teams"/>
      <app-button to="/notes" text="Notes"/>
      <app-button to="/competitions" text="Competitions"/>
      <app-button to="/contacts" text="Contacts"/>
      <app-button to="/users" text="Users"/>
    </div>
  </div>
</template>

<style scoped>
.app-button-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>