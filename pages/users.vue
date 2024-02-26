<script setup lang="ts">
import PouchDB from "pouchdb"
import auth from "../utils/authorization/Authorizer";
import {couchDBBaseURL} from "~/utils/URIs"

PouchDB.plugin(auth)
const usersDB = new PouchDB(`${couchDBBaseURL}/_users`, {skip_setup: true});
const toast = useToast()

  let username = ref("")

  let roles = ref([[""]])
  const roleOptions = ["Coach", "Scout"]
  let prevRoles: string[][] = [[]]
  let resetRoles = false

  let adminAccount = ref(false)

  let userArr = ref([[""]])

  async function setup() {
    try {
      let docs = await usersDB.allDocs()
      resetRoles = true
      userArr.value.length = 0
      roles.value.length = 0
      prevRoles.length = 0
      for (let user of docs.rows) {
        if (user.id.includes("org.couchdb.user:")) {
          let userInfo = await usersDB.getUser(user.id.split(":")[1])
          userArr.value.push([user.id.split(":")[1]])
          if (userInfo.roles) roles.value.push(userInfo.roles)
          else roles.value.push([])
        }
      }
      prevRoles = Array.from(roles.value)
      resetRoles = false
      usersDB.getSession(function (err, response) {
        if (response) {
          if (response.userCtx.roles?.includes("_admin")) {
            adminAccount.value = true
          }
        }
      })
    }
    catch{
      debug("fail")
    }
  }
  setup()

function debug(text:string){
  toast.add({ title: text })
}

  async function createUser() {
    let sessionRoles = await usersDB.getSession()
    if(! (sessionRoles.userCtx.roles && (sessionRoles.userCtx.roles.includes("_admin"))) ) return
    usersDB.signUp(username.value, "temp",
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
        });
  }

  watch(roles.value, (value, oldValue, onCleanup) => {
    if(!resetRoles) {
      for (let i = 0; i < value.length; i++) {
        let updateRoles = false
        for (let j = 0; j < value[i].length; j++) {
          if (value[i][j] != prevRoles[i][j]) {
            updateRoles = true
          }
        }
        if (updateRoles) {
          if (userArr.value[i][0]) editRoles(userArr.value[i][0], value[i])
        }
      }
      prevRoles = Array.from(value)
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

</script>

<template>
  <OuterComponents v-if="adminAccount">
    <div class="flex justify-center">
      <UCard class="max-w-xl flex-grow m-5" style="overflow:visible">
        <template #header>
          <div style="display:flex">
            <div style="flex:1">
              <UInput v-model="username" placeholder="Username"/>
            </div>
            <div style="flex:.5;padding-left:5px">
              <UButton :label="'Create User'" @click="createUser" block></UButton>
            </div>
          </div>
          </template>
        <template #default>
          <UTable :rows="userArr" :columns="columns">
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