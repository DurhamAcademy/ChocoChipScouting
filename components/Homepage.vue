<script setup lang="ts">

</script>

<template>
  <navbar></navbar>
  <div>
    <div class="app-button-grid">
      <div class="app-button">Matches</div>
      <div class="app-button">Teams</div>
      <div class="app-button">Notes</div>
      <div class="app-button">Competitions</div>
      <div class="app-button">Contacts</div>
      <div class="app-button">Users</div>
    </div>
  </div>
</template>

<style scoped>
  .app-button {
    width: 10ch;
    height: 10ch;
    border: black 1px solid;
    padding: 1ch 1ch;
    margin: 1ch;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .app-button-grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
</style>