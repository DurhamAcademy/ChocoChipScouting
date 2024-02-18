<script setup lang="ts">

let errorToast = useToast()

onErrorCaptured((err) => {
  errorToast.add({
    title: err.name,
    description: err.message,
    icon: "i-heroicons-exclamation-triangle",
  })
})

import PouchDB from "pouchdb"
import "./utils/authorization/Authorizer"
import LoginState from "~/utils/authorization/LoginState"
import {loginStateKey} from "~/utils/keys";

console.log(couchDBBaseURL)
let pdb = databases.databases.basic.remote
let session: PouchDB.Authentication.SessionResponse | null = null;
let loginFailed = false;
let offlineReady = false;
let offlinePDB = databases.databases.basic.local
console.log(await offlinePDB.allDocs());
try {
  session = await pdb.getSession();
} catch (e) {
  // failed to login
  console.error(e)
  // see if there is a local database

  // if ()
  loginFailed=true;
}

let loginState = ref((session?.userCtx?.name==null)?LoginState.loggedOut:LoginState.loggedIn)
let route = useRoute()
if ((session!=null) && (loginState.value === LoginState.loggedOut) && (route.matched[0].name != "login"))
  await navigateTo("/login")
else if ((route.matched[0].name == 'index')) navigateTo("/dashboard")

let sessionState = ref(session)
let usernameState = ref(session?.userCtx?.name)

async function updateUsernameState(): Promise<boolean> {
  session = await pdb.getSession()
  if ((session!=null) && (session.ok)) {
    loginState.value = (session.userCtx.name == null) ? LoginState.loggedOut : LoginState.loggedIn
    usernameState.value = session.userCtx.name;
    sessionState.value = session
  } else return false
  return true
}

async function logout() {
  let logout
  let usernameState
  try {
    logout = await pdb.logOut()
    usernameState = await updateUsernameState();
    await navigateTo("/login")
  } catch (e) {
    throw createError({
      name: "Logout Failed",
      message: "Logout or logout validation failed to connect with the server."
    })
  }
  if (logout?.ok !== true) {
    throw createError({
      name: "Logout Failed",
      message: "Logout rejected by server."
    })
  }
  if (usernameState !== true) {
    throw createError({
      name: "Logout Failed",
      message: "Failed to verify logout."
    })
  }
}

const loginStateObject = {loginState, usernameState, sessionState, updateUsernameState, logout};
provide(loginStateKey, loginStateObject)

</script>

<template>
  <div class="min-h-screen min-w-screen">
      <v-app>
<!--    <UContainer class="p-0 m-0">-->
          <NuxtPage v-if="!loginFailed"/>
          <UCard v-else>
            <template #header>
              Connection error
            </template>
            <template #default>
              Your browser failed to connect to the database.
            </template>
          </UCard>
<!--    </UContainer>-->
      </v-app>
    <UNotifications/>
  </div>
</template>

<style scoped>

</style>