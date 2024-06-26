<script setup lang="ts">
import PouchDB from 'pouchdb';
import auth from '../utils/authorization/Authorizer';
import OuterComponents from '~/components/website-utils/OuterComponents.vue';
import { couchDBBaseURL } from '~/utils/URIs';
import { useLazyAsyncData } from '#app';

//declaration for debug/error system
const toast = useToast();

PouchDB.plugin(auth);

//gets a specific users database that is only accessible to admins
const usersDB = new PouchDB(`${couchDBBaseURL}/_users`, { skip_setup: true });

//input fields for new users
let username = ref('');
let password = ref('');
let roles = ref([['']]);

//variables to have the role selection dropdown work => defaults to scout role
let selectedRoles = ref(['scout']);
const roleOptions = ['drive team', 'scout', 'pit', 'other'];

//a variable to ensure a future watch statement doesn't trigger when the page is reloaded
let updatingRoles = false;

//array of all users and their data
let userArr = ref([['']]);

/*
setup function
loads all the important data for the webpage asynchronously
 */
async function setup() {
  try {
    //gets all user data
    let docs = await usersDB.allDocs();
    //resets the userArr and roles arrays as they are about to be refilled from scratch
    userArr.value.length = 0;
    roles.value.length = 0;
    let rolePromises = []; //arr to contain promises
    /*
    loops through every user
    double checks they are actually a user
    gets each users name and adds it to the userArr
    gets each users roles and adds them to the roles arr through a system of promises
     */
    for (let user of docs.rows) {
      if (user.id.includes('org.couchdb.user:')) {
        userArr.value.push([user.id.split(':')[1]]);
        rolePromises.push(
          Promise.resolve(usersDB.getUser(user.id.split(':')[1])),
        );
      }
    }
    updatingRoles = true;
    Promise.all(rolePromises).then(promiseValues => {
      for (let userInfo of promiseValues) {
        if (promiseValues.indexOf(userInfo) == promiseValues.length - 1)
          updatingRoles = false;
        if (userInfo.roles) roles.value.push(userInfo.roles);
        else roles.value.push([]);
      }
    });
    return userArr;
  } catch {
    debug(
      'failed to find users on load. ensure you are logged in on an admin account to access this data.',
    );
  }
}

//creates a debug/error popout
function debug(text: string) {
  toast.add({ title: text });
}

/*
function that signs up new users
uses username, password, and roles from the input fields
 */
async function signUp() {
  //gets users current roles and ensures they are an admin
  let sessionRoles = await usersDB.getSession();
  if (
    !(
      sessionRoles.userCtx.roles &&
      (sessionRoles.userCtx.roles.includes('_admin') ||
        sessionRoles.userCtx.roles.includes('admin'))
    )
  )
    return;
  //calls a couchdb function to sign up a user. not async in order to allow bulk user uploads on poor wifi
  usersDB.signUp(
    username.value,
    password.value,
    {
      metadata: {},
      roles: selectedRoles.value,
    },
    function (err, response) {
      if (err) {
        if (err.name === 'conflict') {
          console.log('Username already exists');
        } else if (err.name === 'forbidden') {
          console.log('Invalid name');
        } else {
          console.log(err.name);
        }
      } else {
        console.log('User created');
        username.value = '';
        password.value = '';
        selectedRoles.value = ['scout'];
        //refreshes the page TODO why do i not just add the data to the arrays
        setup();
      }
    },
  );
}

/*
function that changes the password of a user
uses username and password from input fields
 */
async function changePassword() {
  //gets users current roles and ensures they are an admin

  let sessionRoles = await usersDB.getSession();
  if (
    !(
      sessionRoles.userCtx.roles &&
      (sessionRoles.userCtx.roles.includes('_admin') ||
        sessionRoles.userCtx.roles.includes('admin'))
    )
  )
    return;
  //runs a couchdb function to change a users password
  usersDB.changePassword(
    username.value,
    password.value,
    {},
    function (err, response) {
      if (err) {
        console.log(err);
      } else {
        console.log('Password changed');
        username.value = '';
        password.value = '';
        selectedRoles.value = ['scout'];
        setup();
      }
    },
  );
}

/*
function that facilitates whether signup or change password are the more applicable function given the input field
 */
async function userManage() {
  let sessionRoles = await usersDB.getSession();
  if (
    !(
      sessionRoles.userCtx.roles &&
      (sessionRoles.userCtx.roles.includes('_admin') ||
        sessionRoles.userCtx.roles.includes('admin'))
    )
  )
    return;
  usersDB.getUser(username.value, {}, function (err, response) {
    if (err) {
      if (err.name == 'not_found') {
        signUp();
      }
    } else {
      changePassword();
    }
  });
}

watch(roles.value, value => {
  //if not detected during setup function
  if (!updatingRoles) {
    let promiseArr = [];
    for (let i = 0; i < value.length; i++) {
      promiseArr.push(
        //updates the database based on the new roles.value
        Promise.resolve(editRoles(userArr.value[i][0], value[i])),
      );
    }
    Promise.all(promiseArr);
  }
});

/*
function to update the roles in the database based on the roles on the users page
param new roles gives the roles the user should be assigned
 */
async function editRoles(username: string, newRoles: Array<string>) {
  let sessionRoles = await usersDB.getSession();
  if (
    !(
      sessionRoles.userCtx.roles &&
      (sessionRoles.userCtx.roles.includes('_admin') ||
        sessionRoles.userCtx.roles.includes('admin'))
    )
  )
    return;
  await usersDB.putUser(username, { roles: newRoles });
}

//function to delete a user given a username
async function deleteUser(username: string) {
  let sessionRoles = await usersDB.getSession();
  if (
    !(
      sessionRoles.userCtx.roles &&
      (sessionRoles.userCtx.roles.includes('_admin') ||
        sessionRoles.userCtx.roles.includes('admin'))
    )
  )
    return;
  //runs the couchdb function delete user
  usersDB.deleteUser(username, function (err, result) {
    if (err) {
      console.log(err.name);
    }
    if (result) {
      //removes the user from the arrays, deleting them from the table shown on screen
      for (let i = 0; i < userArr.value.length; i++) {
        if (userArr.value[i].includes(username)) {
          userArr.value.splice(i, 1);
          roles.value.splice(i, 1);
        }
      }
    }
  });
}

//defines the columns of the table shown on screen
const columns = [
  {
    key: 'user',
    label: 'Username',
  },
  {
    key: 'roles',
    label: 'Roles',
  },
  {
    key: 'delete',
  },
];

//runs the setup function asynchronously
const { pending, data: res } = await useLazyAsyncData('res', () => setup());
</script>

<template>
  <OuterComponents>
    <div class="flex justify-center overflow-y-scroll">
      <UCard class="max-w-xl flex-grow m-5 overflow-visible">
        <template #header>
          <UForm class="flex">
            <UFormGroup class="flex-auto basis-1/4">
              <UInput
                v-model="username"
                autocomplete="off"
                placeholder="Username"
              />
            </UFormGroup>
            <UFormGroup class="flex-auto pl-2.5 basis-1/4">
              <UInput
                v-model="password"
                autocomplete="off"
                type="password"
                placeholder="Password"
              />
            </UFormGroup>
            <UFormGroup class="flex-auto pl-2.5 basis-1/8">
              <USelectMenu
                v-model="selectedRoles"
                :options="roleOptions"
                multiple
                placeholder="0 Selected"
              />
            </UFormGroup>
            <UFormGroup class="flex-auto pl-2.5 basis-1/3">
              <UButton
                :label="'Add/Edit User'"
                @click="userManage"
                block
              ></UButton>
            </UFormGroup>
          </UForm>
        </template>
        <template #default>
          <UTable
            :rows="userArr"
            :columns="columns"
            :loading="pending"
            :loading-state="{
              icon: 'i-heroicons-arrow-path-20-solid',
              label: 'Loading...',
            }"
          >
            <template #user-data="{ row }">
              <p>{{ row[0] }}</p>
            </template>
            <template #delete-data="{ row }">
              <UButton
                color="gray"
                variant="soft"
                icon="i-heroicons-trash"
                @click="deleteUser(row[0])"
              />
            </template>
            <template #roles-data="{ row }">
              <USelectMenu
                v-model="roles[userArr.indexOf(row)]"
                :options="roleOptions"
                multiple
                placeholder="0 Selected"
                class="max-w-36 w-36 min-w-24"
              />
            </template>
          </UTable>
        </template>
      </UCard>
    </div>
  </OuterComponents>
</template>

<style scoped></style>
