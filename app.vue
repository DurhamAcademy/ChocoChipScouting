<script setup lang="ts">
import {useOnline} from "@vueuse/core";

let errorToast = useToast()

onErrorCaptured((err) => {
  errorToast.add({
    title: err.name,
    description: err.message,
    icon: "i-heroicons-exclamation-triangle",
  })
})


import PouchDB from "pouchdb";
import auth from "./utils/authorization/Authorizer"
import LoginState from "~/utils/authorization/LoginState"
import {loginStateKey} from "~/utils/keys";

PouchDB.plugin(auth)
let pdb = new PouchDB(couchDBBaseURL + "/basic");
let session = await pdb.getSession();

let loginState = useState<LoginState>("login-state", ()=>{
  console.log((session.userCtx.name==null) ? LoginState.loggedOut: LoginState.loggedIn )
  return (session.userCtx.name==null) ? LoginState.loggedOut: LoginState.loggedIn
});
let route = useRoute()
if ((loginState.value === LoginState.loggedOut) && (route.matched[0].name != "login"))
  await navigateTo("/login")
else if ((route.matched[0].name == 'index')) navigateTo("/dashboard")

let sessionState = ref(session)
let usernameState = useState("username", ()=>(session.userCtx.name))

let online = useOnline()

async function updateUsernameState(): Promise<boolean> {
  session = await pdb.getSession()
  if (session.ok) {
    loginState.value = (session.userCtx.name == null) ? LoginState.loggedOut : LoginState.loggedIn
    usernameState.value = session.userCtx.name;
    sessionState.value = session
  } else if (!online.value) {
    return true
  }
    else return false
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
  <NuxtPwaManifest/>
  <div class="min-h-screen min-w-screen">
    <LazyNuxtLoadingIndicator/>
      <v-app>
<!--    <UContainer class="p-0 m-0">-->
          <NuxtPage/>
<!--    </UContainer>-->
      </v-app>
    <LazyUNotifications/>
  </div>
</template>

<style scoped>

</style>