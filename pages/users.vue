<script setup lang="ts">
  import {couchDBBaseURL} from "~/utils/URIs";

  const usersDB = new PouchDB(`${couchDBBaseURL}/_users`, {skip_setup: true});


  const username = ref("")


  let adminAccount = ref(false)

  let userArr = ref([[""]])

  async function setup() {
    userArr.value.splice(0, 1)
    let docs = await usersDB.allDocs()
    for(let user of docs.rows){
      if(user.id.includes("org.couchdb.user:")){
        userArr.value.push([user.id.split(":")[1]])
      }
    }
    usersDB.getSession(function(err, response){
      if(response){
        if(response.userCtx.roles?.includes("_admin")){
          adminAccount.value = true
        }
      }
    })
  }
  setup()

  function createUser(){
    usersDB.signUp(username.value, "temp",
      {
        metadata:{
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
      }
      else{
        console.log("User created")
        setup()
      }
    });
  }


  function deleteUser(username: string){
    usersDB.deleteUser(username, function (err, response) {
      if (err) {
          console.log(err.name)
      }
    });
    for(let i = 0; i < userArr.value.length; i++) {
      if (userArr.value[i].includes(username)) {
        userArr.value.splice(i, 1)
      }
    }
  }

  const columns = [{
    key: 'user',
    label: 'Username'
  }, {
    key: 'delete',
  }]

</script>

<template>
  <OuterComponents v-if="adminAccount">
    <div class="flex justify-center">
      <UCard class="max-w-xl flex-grow m-5 ">
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
          </UTable>
        </template>
        </UCard>
    </div>
  </OuterComponents>
</template>

<style scoped>

</style>