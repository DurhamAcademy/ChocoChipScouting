<script setup lang="ts">
import { ref } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import {integer} from "vscode-languageserver-types";
import {isNullOrUndefined} from "unenv/runtime/node/util";

const db = new PouchDB("attachment-db")
var info = await db.info();
var total = info.doc_count
console.log(info, total)

async function getDocsPaged(amount: integer, startingAt: integer): Promise<(PouchDB.Core.AllDocsMeta & PouchDB.Core.IdMeta & PouchDB.Core.RevisionIdMeta)[]> {
  let docs = await db.allDocs({limit:amount, skip: startingAt, include_docs: true});
  // noinspection TypeScriptValidateTypes
  let mappedDocs: (PouchDB.Core.AllDocsMeta & PouchDB.Core.IdMeta & PouchDB.Core.RevisionIdMeta)[] = docs.rows.map((doc)=>doc.doc).filter((doc)=> {
    return doc !== undefined
  });
  return mappedDocs
}

const el = ref<HTMLElement>()

const data = ref((await getDocsPaged(40, 0)).map((b)=>{return {name: b.name, team: b.team, author: b.author}}))
console.log(data.value)
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

const showModal = ref(true)
const modalName = ref('name')
const modalAuthor = ref('author')
const modalTeam = ref<number>()
const modalAttachments = ref<URL[]>()

async function view(id: integer) {
  let doc = await db.get(id);
  modalName.value = doc.name;
  modalAuthor.value = doc.author;
  modalTeam.value = doc.team;
  let attachments = doc._attachments;
  let names = Object.keys(attachments)
  for (const name of names) {
    let attachment = (await db.getAttachment(doc._id, name))
    if (attachment instanceof Blob) {
      let file = new File([attachment], name, {type:attachment.type})

    }
  }
}
</script>

<template>
  <div class="w-xl h-screen overflow-y-scroll" ref="el">
    <UTable :rows="data" :columns="columns">
      <template #actions-data="{ row }">
        <UButton color="gray" variant="ghost" icon="i-heroicons-eye" @click="view(row.id)"/>
      </template>
    </UTable>
    <UModal :model-value="showModal">
      <ViewAttachment :name="modalName" :author="modalAuthor" :team="team" :attachments
    </UModal>
  </div>
</template>

<style scoped>

</style>