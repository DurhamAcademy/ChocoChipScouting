<script setup lang="ts">
import "../utils/authorization/Authorizer";
import {couchDBBaseURL} from "~/utils/URIs"
import {loginStateKey} from "~/utils/keys";

const usersDB = new PouchDB(`${couchDBBaseURL}/_users`, {skip_setup: true});
  let username = ref("");
  let password = ref("");
  let error = ref(false)


const {updateUsernameState}: { updateUsernameState: () => void } = inject(loginStateKey)!

async function login(username: string, password: string) {
    try
    {
      window.localStorage.setItem("event", selectedEvent.value)

      usersDB.logIn(username, password, async function (err, response) {
        if (response) {
          updateUsernameState()
          navigateTo("/dashboard")
        }
        else if (err) {
          let loginResult = await usersDB.logIn("admin", "password")
          if(loginResult){
            let getUserResult = await usersDB.getUser(username)
            if (getUserResult && getUserResult.unaccessedAccount != undefined && getUserResult.unaccessedAccount) {
              await unaccessedAccountReset(username, password)
            }
            else{
              error.value = true
            }
          }
          else{
            error.value = true
          }
        }
        else{
          error.value = true
        }
      })

    }
    catch (e) {
      error.value = true
    }
  }

  async function unaccessedAccountReset(username: string, password: string){
    usersDB.changePassword(username, password).then(() => {
      usersDB.putUser(username, { metadata: { unaccessedAccount: false }}).then(() => {
        usersDB.logOut().then(() =>{
          usersDB.logIn(username, password).then(() =>{
            updateUsernameState()
            navigateTo("/dashboard")
          }).catch(()=>{
            error.value = true
          }).catch(()=>{
            error.value = true
          })
        }).catch(()=>{
          error.value = true
        })
      })
    }).finally(() => {
      error.value = true
    })
  }


//also change in navbar
const events = ['2024test', '2024trial', '2023ncash']

const selectedEvent = ref(window.localStorage.getItem('event') != undefined ? window.localStorage.getItem('event') : events[0])
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
          <USelectMenu v-model="selectedEvent" :options="events" />
        </UFormGroup>
        <UFormGroup class="inputDiv" style="padding-top: 10px">
          <UButton
                  @click="
                  login(username, password)"
                   type="submit">Login
          </UButton>
        </UFormGroup>
        <p v-if="error">An error occurred.</p>
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