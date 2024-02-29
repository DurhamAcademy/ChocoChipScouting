<script setup lang="ts">
import PouchDB from "pouchdb"
import auth from "../utils/authorization/Authorizer";
import {couchDBBaseURL} from "~/utils/URIs"
import {useLazyAsyncData} from "#app";

PouchDB.plugin(auth)
const usersDB = new PouchDB(`${couchDBBaseURL}/_users`, {skip_setup: true});
const toast = useToast()

let username = ref("")
let password = ref("")

let roles = ref([[""]])
const roleOptions = ["Coach", "Scout"]

let adminAccount = ref(false)
let updatingRoles = false

let userArr = ref([[""]])

async function setup() {
  try {
    let docs = await usersDB.allDocs()
    userArr.value.length = 0
    roles.value.length = 0
    let rolePromises = []
    for (let user of docs.rows) {
      if (user.id.includes("org.couchdb.user:")) {
        userArr.value.push([user.id.split(":")[1]])
        rolePromises.push(Promise.resolve(usersDB.getUser(user.id.split(":")[1])))
      }
    }
    updatingRoles = true
    Promise.all(rolePromises).then((promiseValues) => {
      for(let userInfo of promiseValues) {
        if(promiseValues.indexOf(userInfo) == promiseValues.length - 1) updatingRoles = false
        if (userInfo.roles) roles.value.push(userInfo.roles)
        else roles.value.push([])
      }
    })

    usersDB.getSession(function (err, response) {
      if (response) {
        if (response.userCtx.roles?.includes("_admin")) {
          adminAccount.value = true
        }
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

async function signUp() {
  usersDB.signUp(username.value, password.value,
      {
        metadata: {
          unaccessedAccount: true
        }
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
          setup()
        }
      }
  );
}

async function changePassword() {
  usersDB.changePassword(username.value, password.value,
      {

      }, function(err, response) {
        if(err) {
          console.log(err)
        } else {
          console.log("Password changed")
          setup()
        }
      }
  )
}

async function userManage() {
  let sessionRoles = await usersDB.getSession()
  if(! (sessionRoles.userCtx.roles && (sessionRoles.userCtx.roles.includes("_admin"))) ) return
  usersDB.getUser(username.value,
      {

      }, function (err, response) {
        if(err) {
          if(err.name == 'not_found') {
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
      promiseArr.push(Promise.resolve(editRoles(userArr.value[i][0], value[i])))
    }
    Promise.all(promiseArr)
  }
})

async function editRoles(username: string, newRoles: Array<string>) {
  let sessionRoles = await usersDB.getSession()
  if(! (sessionRoles.userCtx.roles && (sessionRoles.userCtx.roles.includes("_admin"))) ) return
  await usersDB.putUser(username, {roles: newRoles})
}

async function deleteUser(username: string) {
  let sessionRoles = await usersDB.getSession()
  if(! (sessionRoles.userCtx.roles && (sessionRoles.userCtx.roles.includes("_admin"))) ) return
  usersDB.deleteUser(username, function (err, result) {
    if (err) {
      console.log(err.name)
    }
    if (result) {
      for (let i = 0; i < userArr.value.length; i++) {
        if (userArr.value[i].includes(username)) {
          userArr.value.splice(i, 1)
          roles.value.splice(i, 1)
        }
      }
    }
  });
}

const columns = [{
  key: 'user',
  label: 'Username'
}, {
  key: 'roles',
  label: "Roles"
}, {
  key: 'delete',
}]

const { pending, data: res } = await useLazyAsyncData('res', () => setup())
</script>

<template>
  <OuterComponents v-if="adminAccount">
    <div class="flex justify-center overflow-y-scroll">
      <UCard class="max-w-xl flex-grow m-5 overflow-visible">
        <template #header>
          <UForm class="flex">
            <UFormGroup class="flex-auto">
              <UInput v-model="username" autocomplete="off" placeholder="Username"/>
            </UFormGroup>
            <UFormGroup class="flex-auto pl-2.5">
            <UInput v-model="password" autocomplete="off" type="password" placeholder="Password"/>
            </UFormGroup>
            <UFormGroup class="flex-auto pl-2.5">
              <UButton :label="'Add/Edit User'" @click="userManage" block></UButton>
            </UFormGroup>
          </UForm>
          </template>
        <template #default>
          <UTable :rows="userArr" :columns="columns" :loading="pending" :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }">
            <template #user-data="{ row }">
              <p>{{ row[0] }}</p>
            </template>
            <template #delete-data="{ row }">
              <UButton color="gray" variant="soft" icon="i-heroicons-trash" @click="deleteUser(row[0])"/>
            </template>
            <template #roles-data="{ row }">
              <USelectMenu v-model="roles[userArr.indexOf(row)]" :options="roleOptions" multiple placeholder="0 Selected" class="max-w-36 w-36 min-w-24"/>
            </template>
          </UTable>
        </template>
        </UCard>
    </div>
  </OuterComponents>
</template>

<style scoped>

</style>