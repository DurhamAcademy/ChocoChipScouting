<script setup lang="ts">
import {ref} from 'vue'
import {useInfiniteScroll} from '@vueuse/core'
import AddButton from "~/components/AddButton.vue";
import {useRoute} from "vue-router";
import databases from "~/utils/databases"

const { attachments } = databases.locals

const db = attachments;
var info = await db.info();
var total = info.doc_count
var rowId = ""
console.log(info, total)

async function getDocsPaged(amount: number, startingAt: number): Promise<(PouchDB.Core.ExistingDocument<{ event: any; name: string; teamNumber: number; fileSize: string; author : string | undefined; tags: string[] ; extraNotes: string; dateUploaded: string }>)[]> {
  let docs = await db.allDocs({limit:amount, skip: startingAt, include_docs: true});
  // noinspection TypeScriptValidateTypes
  return docs.rows.map((doc) => doc.doc).filter((doc) => {
    return doc!
  })
}

const el = ref<HTMLElement>()

const data = ref((await getDocsPaged(40, 0)).map((b)=>{return {name: b.name, teamNumber: b.teamNumber, author: b.author, id: b._id}}))

useInfiniteScroll(
    el,
    async (state) => {
      if (data.value.length < total) {
        let a = await getDocsPaged(20, data.value.length)

        data.value.concat(a.map((b)=>{return {name: b.name, teamNumber: b.teamNumber, author: b.author, id: b._id}}))
      }
    },
    { distance: 10 }
)

const columns  = [
  {key:'name', label: "Name"},
  {key: 'teamNumber', label: "Team #"},
  {key: 'author', label: "Author"},
    {key: 'actions'}
]
let route = ref(useRoute())
const router = useRouter()
router.afterEach(()=>{route.value = useRoute()})
const isAttach = route.value.matched.find((match)=>match.name=="attachments-id") !== undefined
const showModal = ref<boolean>(isAttach)
const hideAll = ref((route.value.matched.length!==1) && (!isAttach))
const isOpen = ref(false)
async function view(id: string) {
  await navigateTo("/attachments/"+id)
}
async function close() {
  await navigateTo('/attachments')
}

async function deleteAttachment(id: string) {
  var doc = await db.get(id);
  await db.remove(doc);
  data.value = data.value.filter(doc => doc.id != id)
  isOpen.value = false
  close()
}

</script>

<template>
  <OuterComponents>
      <!--
        <div class="flex justify-center">
          <UCard class="max-w-xl flex-grow m-5">
            <div class="flex">
              <UInput v-model="teamNumber" placeholder="Team #" type="number" min="-1" max="9999"/>
              <UButton label="Search" :disabled="teamNumber==null || teamNumber==0 || teamNumber < -1 || teamNumber > 9999" @click="console.log(teamNumber)"/>
            </div>
            <UButton label="Or Browse"/>
          </UCard>
        </div>
        -->
      <div class="w-xl h-screen overflow-y-scroll" ref="el">
        <UTable :rows="data" :columns="columns">
          <template #actions-data="{ row }">
            <UButton color="gray" variant="ghost" icon="i-heroicons-eye" @click="view(row.id); showModal=true;"/>
            <UButton color="gray" variant="ghost" icon="i-heroicons-trash" @click="isOpen = true; rowId = row.id; view(row.id)"/>
          </template>
        </UTable>
        <UModal v-model="isOpen" prevent-close :overlay="false" :onClose="close">
          <NuxtPage/>
          <div class="p-5" style="text-align:center">
            <UButton class="m-0.5" color="gray" variant="outline" label="Cancel" @click="isOpen = false"/>
            <UButton class="m-0.5" color="red" variant="solid" label="Delete" @click="deleteAttachment(rowId)"/>
          </div>
        </UModal>
        <UModal v-model="showModal" :onClose="close">
          <NuxtPage/>
        </UModal>
      </div>
      <AddButton/>
  </OuterComponents>
</template>

<style scoped>

</style>