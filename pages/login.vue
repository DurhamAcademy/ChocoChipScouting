<script setup lang="ts">
import "../utils/authorization/Authorizer";
import {couchDBBaseURL} from "~/utils/URIs"
import {loginStateKey} from "~/utils/keys";

var usersDB = new PouchDB(`${couchDBBaseURL}/_users`, {skip_setup: true});
  let username = ref("");
  let password = ref("");
  let repeatPassword = ref("")
  let signUpPage = ref(false);
  let passwordsMustMatch = ref(false);
  let error = ref(false)


const {updateUsernameState}: { updateUsernameState: () => void } = inject(loginStateKey)!

  async function login(username: string, password: string) {
    try{
      var result = await usersDB.logIn(username, password)
      if (result.ok) {
        updateUsernameState()
        navigateTo("/dashboard")
      } else error.value = true
    } catch (e) {
      error.value = true
    }
  }

  async function signUp(username: string, password: string, repeatPassword: string) {
    if (password == repeatPassword) {
      try {
        let {ok} = await usersDB.signUp(username, password);
        if (ok) {
          signUpPage.value=false;
          error.value=false
        } else {
          error.value = true;
        }
      } catch (e) {
        error.value = true
      }

    } else {
      validateInput()
    }
  }

  function validateInput() {
    try {
      // noinspection RedundantIfStatementJS
      if ((!signUpPage.value) || (password.value == repeatPassword.value)) {
        passwordsMustMatch.value = false;
      } else {
        passwordsMustMatch.value = true;
      }
    } catch (e) {

    }
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
          {{ (signUpPage) ? "Signup" : "Login" }}
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
        <UFormGroup v-if="signUpPage"
                    :error="error && 'You must enter an email'"
                    label="Repeat Password"
                    name="repeat-password"
                    required>
          <UInput v-model="repeatPassword"
                  placeholder="Repeat password"
                  required
                  type="password"/>
        </UFormGroup>
        <p v-if="passwordsMustMatch">Passwords must match.</p>
        <p v-if="error">An error occurred.</p>
        <UFormGroup class="inputDiv">
          <UButton v-if="!signUpPage"
                  @click="
                  login(username, password)"
                   type="submit">Login
          </UButton>
        </UFormGroup>
        <UFormGroup class="inputDiv">
          <UButton v-if="signUpPage"
                  @click="
                  signUp(username,password,repeatPassword);"
                   type="submit">Signup
          </UButton>
        </UFormGroup>
        <p v-if="!signUpPage">Don't have an account? <a href="javascript:void(0)" @click="signUpPage=!signUpPage; repeatPassword=''">Signup</a>!</p>
        <p v-if="signUpPage">Already have an account? <a href="javascript:void(0)" @click="signUpPage=!signUpPage; repeatPassword=''">Login</a>!</p>
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