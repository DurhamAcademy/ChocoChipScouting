<script setup lang="ts">
import "./utils/Authorizer"
import LoginState from "~/utils/LoginState"
import {loginStateKey} from "~/utils/keys";

let pdb = new PouchDB(couchDBBaseURL + "/basic");
let session = await pdb.getSession();

let loginState = ref((session.userCtx.name==null)?LoginState.loggedOut:LoginState.loggedIn)
function updateLoginState(newState: LoginState) {loginState.value = newState}
provide(loginStateKey, {loginState, updateLoginState})
</script>

<template>
  <div>
    <Login v-if="loginState == LoginState.loggedOut"/>
    <homepage/>
  </div>
</template>

<style scoped>

</style>