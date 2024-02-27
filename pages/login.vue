<script setup lang="ts">
import PouchDB from "pouchdb";
import auth from "../utils/authorization/Authorizer";
import {couchDBBaseURL} from "~/utils/URIs"
import {loginStateKey} from "~/utils/keys";
import {eventOptions} from "~/utils/eventOptions";

PouchDB.plugin(auth)
const usersDB = new PouchDB(`${couchDBBaseURL}/basic`, {skip_setup: true});
  let username = ref("");
  let password = ref("");
  let error = ref(false)
let loading = ref(false)


const events = eventOptions
const selectedEvent = useState<String>("currentEvent", ()=>window?.localStorage?.getItem("currentEvent") || eventOptions[0]);

const {updateUsernameState}: { updateUsernameState: () => void } = inject(loginStateKey)!

let errorVal = useState("error-val",()=>"")

async function login(username: string, password: string) {
    try
    {
      loading.value = true
      usersDB.logIn(username, password, async function (err, response) {
        loading.value=false
        if (response) {
          updateUsernameState()
          navigateTo("/dashboard")
        }
        else{
          error.value = true
        }
      })
    }
    catch (e : any) {
      error.value = true
    }
  }



</script>

<template>
  <LazyUContainer :ui="{
  'base': 'mx-auto',
  'padding': 'p-4 sm:p-6 lg:p-8',
  'constrained': 'max-w-sm'
  }">
    <LazyUCard>
      <template #header>
        <h2 class="font-semibold text-xl text-gray-900 dark:text-white leading-tight">
          {{ "Login" }}
        </h2>
      </template>

      <LazyUForm action="javascript:void(0);">
        <LazyUFormGroup label="Username" name="username" autocomplete="username" required>
          <UInput required
                  :disabled="loading"
                  v-model="username"
                  type="text"/>
        </LazyUFormGroup>
        <LazyUFormGroup label="Password" name="password" autocomplete="current-password" required>
          <LazyUInput v-model="password"
                  placeholder="Password"
                  required
                  :disabled="loading"
                  type="password"/>
        </LazyUFormGroup>
        <LazyUFormGroup class="inputDiv" label="Event" name="event" required>
          <LazyUSelectMenu :disabled="loading" v-model="selectedEvent" :options="events" @update:v-model="value => {localStorage.setItem('currentEvent', value)}"/>
        </LazyUFormGroup>
        <LazyUFormGroup class="inputDiv" style="padding-top: 10px">
          <LazyUButton
              :loading="loading"
                  @click="
                  login(username, password)"
                   type="submit">Login
          </LazyUButton>
        </LazyUFormGroup>
        <p>{{ errorVal }}</p>
      </LazyUForm>
    </LazyUCard>
  </LazyUContainer>
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