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

async function getDocsPaged(amount: integer, startingAt: integer): Promise<(PouchDB.Core.ExistingDocument<{name: string, team: number | undefined, author: string}>)[]> {
  let docs = await db.allDocs({limit:amount, skip: startingAt, include_docs: true});
  // noinspection TypeScriptValidateTypes
  return docs.rows.map((doc) => doc.doc).filter((doc) => {
    let a = doc!
    return a
  })
}

const el = ref<HTMLElement>()

const data = ref((await getDocsPaged(40, 0)).map((b)=>{return {name: b.name, team: b.team, author: b.author, id: b._id}}))

useInfiniteScroll(
    el,
    async (state) => {
      if (data.value.length < total) {
        let a = await getDocsPaged(20, data.value.length)
        console.log(a, data.value)

        data.value.concat(a.map((b)=>{return {name: b.name, team: b.team, author: b.author, id: b._id}}))
      }
    },
    { distance: 10 }
)

const columns  = [
  {key:'name', label: "Name"},
  {key: 'team', label: "Team"},
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
}

</script>

<template>
  <Navbar/>
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
</template>

<style scoped>

</style>