<script setup lang="ts">
  import {couchDBBaseURL} from "~/utils/URIs";

  const usersDB = new PouchDB(`${couchDBBaseURL}/_users`, {skip_setup: true});


  const username = ref("")
  const password = ref("")

  let userArr = ref([[""]])

  async function test() {
    userArr.value.splice(0, 1)
    let docs = await usersDB.allDocs()
    for(let user of docs.rows){
      if(user.id.includes("org.couchdb.user:")){
        userArr.value.push([user.id.split(":")[1]])
      }
    }
  }
  test()

  function createUser(){
    usersDB.signUp(username.value, password.value, function (err, response) {
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
      }
    });
  }
  function deleteUser(username: string){
    usersDB.deleteUser(username, function (err, response) {
      if (err) {
          console.log(err.name)
      }
    });
    for(let i = 0; i < userArr.value.length; i++){
      if(userArr.value[i].includes(username)){
        userArr.value.splice(i, 1)
      }
    }
  }
  function createAdmin(){
    usersDB.signUpAdmin(username.value, password.value, function (err, response) {
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
      }
    });
  }

  const columns = [{
    key: 'user',
    label: 'Username'
  }, {
    key: 'delete',
  }]

</script>

<template>
  <OuterComponents>
    <div class="flex justify-center">
      <UCard class="max-w-xl flex-grow m-5 ">
        <template #header>
          <div style="display:flex">
            <div style="flex:1">
              <UInput v-model="username" placeholder="Username"/>
            </div>
            <div style="flex:1;padding-left:5px">
              <UInput v-model="password" placeholder="Password"/>
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
              <UPopover>
              <UButton color="gray" variant="soft" icon="i-heroicons-trash" />
              <template #panel>
                <UCard>
                  <div class="max-w-xs overflow-y-auto">
                    <UButton color="red" @click="deleteUser(row[0])">Confirm</UButton>
                  </div>
                </UCard>
              </template>
              </UPopover>
            </template>
          </UTable>
        </template>
        </UCard>
    </div>
  </OuterComponents>
</template>

<style scoped>

</style>