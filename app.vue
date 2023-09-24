<script setup lang="ts">
import "./utils/authorization/Authorizer"
import LoginState from "~/utils/authorization/LoginState"
import {loginStateKey} from "~/utils/keys";

let pdb = new PouchDB(couchDBBaseURL + "/basic");
let session = await pdb.getSession();

let loginState = ref((session.userCtx.name==null)?LoginState.loggedOut:LoginState.loggedIn)
let route = useRoute()
console.log(route)
if ((loginState.value === LoginState.loggedOut) && route.fullPath != "/login") await navigateTo("/login")

let sessionState = ref(session)
let usernameState = ref(session.userCtx.name)

async function updateUsernameState(): Promise<boolean> {
  session = await pdb.getSession()
  if (session.ok) {
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

provide(loginStateKey, {loginState, usernameState, sessionState, updateUsernameState, logout})

let errorToast = useToast()

onErrorCaptured((err) => {
  errorToast.add({
    title: err.name,
    description: err.message,
    icon: "i-heroicons-exclamation-triangle",
    color: "bg-red-400"
  })
})
</script>

<template>
  <div>
    <UContainer class="p-0 m-0">
      <div class="ale"></div>
      <NuxtPage/>
    </UContainer>

    <UNotifications/>
  </div>
</template>

<style scoped>

</style>