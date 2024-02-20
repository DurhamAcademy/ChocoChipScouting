<script setup lang="ts">
import "../utils/authorization/Authorizer";
import {couchDBBaseURL} from "~/utils/URIs"
import {loginStateKey} from "~/utils/keys";
import {eventOptions} from "~/utils/eventOptions";
import PouchDB from "pouchdb"

const usersDB = new PouchDB(`${couchDBBaseURL}/_users`, {skip_setup: true});
  let username = ref("");
  let password = ref("");
  let error = ref(false)

const events = eventOptions
const selectedEvent = window.localStorage.getItem("currentEvent") || eventOptions[0]

const {updateUsernameState}: { updateUsernameState: () => void } = inject(loginStateKey)!

let errorVal = ref("loaded")

async function login(username: string, password: string) {
    try
    {
      errorVal.value = "run login"
      errorVal.value = JSON.stringify(usersDB.allDocs)
      usersDB.logIn(username, password, async function (err, response) {
        if (response) {
          errorVal.value = "logged in"
          updateUsernameState()
          navigateTo("/dashboard")
        }
        else if (err) {
          errorVal.value = "failed login"
          let loginResult = await usersDB.logIn("admin", "password")
          if(loginResult){
            let getUserResult = await usersDB.getUser(username)
            if (getUserResult && getUserResult.unaccessedAccount != undefined && getUserResult.unaccessedAccount) {
              await unaccessedAccountReset(username, password)
            }
            else{
              if(err.error) errorVal.value = err.error.toString()
              error.value = true
            }
          }
          else{
            if(err.error) errorVal.value = err.error.toString()
            error.value = true
          }
        }
        else{
          error.value = true
        }
      })

    }
    catch (e : any) {
      //errorVal.value = e.toString()
    }
  }

  async function unaccessedAccountReset(username: string, password: string){
    usersDB.changePassword(username, password).then(() => {
      usersDB.putUser(username, { metadata: { unaccessedAccount: false }}).then(() => {
        usersDB.logOut().then(() =>{
          usersDB.logIn(username, password).then(() =>{
            updateUsernameState()
            navigateTo("/dashboard")
          }).catch((err)=>{
            if(err.error) errorVal.value = err.error.toString()
            error.value = true
          }).catch((err)=>{
            if(err.error) errorVal.value = err.error.toString()
            error.value = true
          })
        }).catch((err)=>{
          if(err.error) errorVal.value = err.error.toString()
          error.value = true
        })
      })
    }).finally(() => {
      error.value = true
    })
  }

</script>

<template>
  <UContainer :ui="{
  'base': 'mx-auto',
  'padding': 'p-4 sm:p-6 lg:p-8',
  'constrained': 'max-w-sm'
  }">
    <UCard>
      <template #header>
        <h2 class="font-semibold text-xl text-gray-900 dark:text-white leading-tight">
          {{ "Login" }}
        </h2>
      </template>

      <UForm action="javascript:void(0);">
        <UFormGroup label="Username" name="username" required>
          <UInput required
                 v-model="username"
                  type="text"/>
        </UFormGroup>
        <UFormGroup label="Password" name="password" required>
          <UInput v-model="password"
                  placeholder="Password"
                  required
                  type="password"/>
        </UFormGroup>
        <UFormGroup class="inputDiv" label="Event" name="event" required>
          <USelectMenu v-model="selectedEvent" :options="events" @update:v-model="value => {localStorage.setItem('currentEvent', value)}"/>
        </UFormGroup>
        <UFormGroup class="inputDiv" style="padding-top: 10px">
          <UButton
                  @click="
                  login(username, password)"
                   type="submit">Login
          </UButton>
        </UFormGroup>
        <p>{{ errorVal }}</p>
      </UForm>
    </UCard>
  </UContainer>
</template>

<style scoped>
/*
.inputDiv {
  width: 80%;
  max-width: 25em;
  margin: 0;
}
input, button {
  width: 100%;
  padding: 15px;
}
!* Full-width input fields *!
input[type=text], input[type=password] {
  margin: 5px 0 22px 0;
  display: inline-block;
  border: none;
  background: #f1f1f1;
}

!* Add a background color when the inputs get focus *!
input[type=text]:focus, input[type=password]:focus {
  background-color: #ddd;
  outline: none;
}

!* Set a style for all buttons *!
button {
  background-color: #04AA6D;
  color: white;
  margin: 8px 0;
  border: none;
  cursor: pointer;
  opacity: 0.9;
}

p {

}

.outer-login {
  position: unset;
  top: 0;
  left: 0;
  width: 100vh;
  height: 100vh;
}
.inner-login {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
//max-width: 250em;
}*/
</style>