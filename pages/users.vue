<script setup lang="ts">
import PouchDB from "pouchdb"
import auth from "../utils/authorization/Authorizer";
import {couchDBBaseURL} from "~/utils/URIs"
import {useLazyAsyncData} from "#app";
import type {Ref} from "@vue/reactivity";
import type {UnwrapRef} from "vue";
import LoginState from "~/utils/authorization/LoginState";
import {loginStateKey} from "~/utils/keys";


PouchDB.plugin(auth)
const usersDB = new PouchDB(`${couchDBBaseURL}/_users`, {skip_setup: true});
const toast = useToast()

const roleOptions = ["drive team", "scout", 'pit', 'other']
let orgOptions = ["DARC SIDE", "VOLTCATS"]

let username = ref("")
let password = ref("")
let selectedRoles = ref([roleOptions[1]])
let selectedOrg = ref(orgOptions[0])
let firstName = ref("")
let lastName = ref("")

let roles = ref([[""]])

let updatingRoles = false

let userArr = ref<Array<{ roles: Array<any>, username: string,  org: string, name: string }>>([])

async function setup() {
  try {
    let docs = await usersDB.allDocs()
    userArr.value.length = 0
    roles.value.length = 0
    let rolePromises = []
    for (let user of docs.rows) {
      if (user.id.includes("org.couchdb.user:")) {
        rolePromises.push(Promise.resolve(usersDB.getUser(user.id.split(":")[1])))
      }
    }
    updatingRoles = true
    Promise.all(rolePromises).then((promiseValues) => {
      for(let userInfo of promiseValues) {
        userArr.value.push({
          roles: [],
          username: userInfo.name,
          org: userInfo.organization,
          name: userInfo.firstName + " " + userInfo.lastName
        })
        console.log(userArr.value)
        if(promiseValues.indexOf(userInfo) == promiseValues.length - 1) updatingRoles = false
        if (userInfo.roles) roles.value.push(userInfo.roles)
        else roles.value.push([])
      }
    })
    return userArr
  }
  catch{
    debug("fail")
  }
}

function debug(text:string){
  toast.add({ title: text })
}

async function testAdminPermissions(){
  let sessionRoles = await usersDB.getSession()
  return sessionRoles.userCtx.roles && (sessionRoles.userCtx.roles.includes("_admin"));
}

async function signUp() {
  if(!(await testAdminPermissions())) return
  let signUpRoles = []
  for(let role of selectedRoles.value){
    signUpRoles.push("role:" + role)
  }
  signUpRoles.push("org:" + selectedOrg.value)
  signUpRoles.push("first_name:" + firstName.value)
  signUpRoles.push("last_name:" + lastName.value)
  usersDB.signUp(username.value, password.value,
      {
        roles: signUpRoles
      }, function (err, response) {
        if (err) {
          if (err.name === 'conflict') {
            console.log("Username already exists")
          } else if (err.name === 'forbidden') {
            console.log("Invalid name")
          } else {
            console.log(err.name)
          }
        } else {
          console.log("User created")
          username.value = ""
          password.value = ""
          setup()
        }
      }
  );
}

async function changePassword() {
  if(!(await testAdminPermissions())) return
  usersDB.changePassword(username.value, password.value,
      {}, function (err, response) {
        if (err) {
          console.log(err)
        } else {
          console.log("Password changed")
          username.value = ""
          password.value = ""
          setup()
        }
      }
  )
}

async function userManage() {
  if(!(await testAdminPermissions())) return
  usersDB.getUser(username.value,
      {}, function (err, response) {
        if (err) {
          if (err.name == 'not_found') {
            signUp()
          }
        } else {
          changePassword()
        }
      }
  )
}

watch(roles.value, (value) => {
  if(!updatingRoles) {
    let promiseArr = []
    for (let i = 0; i < value.length; i++) {
      promiseArr.push(Promise.resolve(editRoles(userArr.value[i].username, value[i])))
    }
    Promise.all(promiseArr)
  }
})

async function editRoles(username: string, newRoles: Array<string>) {
  if(!(await testAdminPermissions())) return
  await usersDB.putUser(username, {roles: newRoles})
}

async function deleteUser(username: string) {
  if(!(await testAdminPermissions())) return
  usersDB.deleteUser(username, function (err, result) {
    if (err) {
      console.log(err.name)
    }
    if (result) {
      for (let i = 0; i < userArr.value.length; i++) {
        console.log(userArr.value[i])
        if (userArr.value[i].username == username) {
          userArr.value.splice(i, 1)
          roles.value.splice(i, 1)
        }
      }
    }
  });
}

const columns = [{
  key: 'username',
  label: 'Username'
}, {
  key: 'org',
  label: 'Organization'
}, {
  key: 'name',
  label: 'Name'
}, {
  key: 'roles',
  label: "Roles"
}, {
  key: 'delete',
}]

const { pending, data: res } = await useLazyAsyncData('res', () => setup())
</script>

<template>
  <OuterComponents>
    <div class="flex justify-center overflow-y-scroll">
      <UCard class="max-w-2xl flex-grow m-5 overflow-visible">
        <template #header>
          <UDivider size="xs" label="Required Credentials"/>
          <UForm class="flex mt-3">
            <UFormGroup required label="Username" class="flex-auto">
              <UInput v-model="username" autocomplete="off" placeholder="Username"/>
            </UFormGroup>
            <UFormGroup required label="Password" class="flex-auto pl-2.5">
              <UInput v-model="password" autocomplete="off" type="password" placeholder="Password"/>
            </UFormGroup>
            <UFormGroup class="flex-auto pl-2.5 mt-6">
              <UButton :label="'Add/Edit User'" @click="userManage" block></UButton>
            </UFormGroup>
          </UForm>
          <UDivider class="mt-4" size="xs" label="Optional Metadata"/>
          <UForm class="flex mt-3">

            <UFormGroup label="First Name">
              <UInput v-model="firstName" class="flex-auto" placeholder="First Name" size="xs"/>
            </UFormGroup>

            <UFormGroup class="ml-2" label="Last Name">
              <UInput v-model="lastName" class="flex-auto" placeholder="Last Name" size="xs"/>
            </UFormGroup>

            <UFormGroup class="flex-auto ml-2 max-w-32 w-28 min-w-28" label="User Roles">
              <USelectMenu v-model="selectedRoles" :options="roleOptions" multiple placeholder="0 Selected" size="xs"/>
            </UFormGroup>

            <UFormGroup class="flex-auto ml-2 max-w-28 w-28 min-w-28" label="User Org">
              <USelectMenu creatable v-model="selectedOrg" :options="orgOptions" placeholder="0 Selected" size="xs"/>
            </UFormGroup>

          </UForm>
        </template>
        <template #default>
          <UTable :rows="userArr" :columns="columns" :loading="pending" :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }">
            <template #user-data="{ row }">
              <p>{{ row[0] }}</p>
            </template>
            <template #delete-data="{ row }">
              <UButton color="gray" variant="soft" icon="i-heroicons-trash" @click="deleteUser(row.username)"/>
            </template>
            <template #roles-data="{ row }">
              <USelectMenu size="xs" v-model="roles[userArr.indexOf(row)]" :options="roleOptions" multiple placeholder="0 Selected" class="max-w-28 w-28 min-w-28"/>
            </template>
          </UTable>
        </template>
      </UCard>
    </div>
  </OuterComponents>
</template>

<style scoped>

</style>