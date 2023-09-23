<script setup lang="ts">
  import "../utils/Authorizer";
  import {couchDBBaseURL} from "~/utils/URIs"
  import {loginStateKey} from "~/utils/keys";
  import LoginState from "~/utils/LoginState";

  var usersDB = new PouchDB(`${couchDBBaseURL}/_users`, {skip_setup: true});
  let username = ref("");
  let password = ref("");
  let repeatPassword = ref("")
  let signUpPage = ref(false);
  let passwordsMustMatch = ref(false);
  let error = ref(false)

  const {updateLoginState}: {updateLoginState: (newState: LoginState)=>void} = inject(loginStateKey)!

  async function login(username: string, password: string) {
    try{
      var result = await usersDB.logIn(username, password)
    } catch (e) {
      error.value = true
    }
    if (result.ok) {
      updateLoginState(LoginState.loggedIn)
      navigateTo("/dashboard")
    }
    else error.value = true
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
    // noinspection RedundantIfStatementJS
    if ((password.value == repeatPassword.value) || (repeatPassword.value.length == 0)) {
      passwordsMustMatch.value = false;
    } else {
      passwordsMustMatch.value = true;
    }
  }

</script>

<template>
  <div class="outer-login">
    <div class="inner-login">
      <form action="javascript:void(0);">
        <div class="inputDiv">
          <input type="text"
                 v-model="username"
                 placeholder="Username"
                 required>
        </div>
        <div class="inputDiv">
          <input type="password"
                 v-model="password"
                 placeholder="Password"
                 @input="validateInput()"
                 required>
        </div>
        <div class="inputDiv">
          <input v-if="signUpPage"
                 type="password"
                 v-model="repeatPassword"
                 placeholder="Repeat password"
                 @input="validateInput()"
                 required>
        </div>
        <p v-if="passwordsMustMatch">Passwords must match.</p>
        <p v-if="error">An error occurred.</p>
        <div class="inputDiv">
          <button v-if="!signUpPage"
                  @click="
                  login(username, password)"
                  type="submit">Login</button>
        </div>
        <div class="inputDiv">
          <button v-if="signUpPage"
                  @click="
                  signUp(username,password,repeatPassword);"
                  type="submit">Signup</button>
        </div>
        <p v-if="!signUpPage">Don't have an account? <a href="javascript:void(0)" @click="signUpPage=!signUpPage; repeatPassword=''">Signup</a>!</p>
        <p v-if="signUpPage">Already have an account? <a href="javascript:void(0)" @click="signUpPage=!signUpPage; repeatPassword=''">Login</a>!</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.inputDiv {
  width: 80%;
  max-width: 25em;
  margin: 0;
}
input, button {
  width: 100%;
  padding: 15px;
}
/* Full-width input fields */
input[type=text], input[type=password] {
  margin: 5px 0 22px 0;
  display: inline-block;
  border: none;
  background: #f1f1f1;
}

/* Add a background color when the inputs get focus */
input[type=text]:focus, input[type=password]:focus {
  background-color: #ddd;
  outline: none;
}

/* Set a style for all buttons */
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
}
</style>