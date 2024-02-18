<script setup lang="ts">

import {ref} from "vue";
import databases from "~/utils/databases"

const { attachments } = databases.locals
const db = attachments;

const showModal = ref<boolean>(false)
const modalName = ref<string>('name')
const modalAuthor = ref<string>('author')
const modalTeam = ref<number>()
const modalAttachments = ref<string[]>([])

async function view(id: string) {
  console.trace("view called", id)
  console.log("hello", id)
  let doc = await db.get(id)
  console.log(doc)
  let oldAttachments = modalAttachments.value
  for (const modalAttachment of oldAttachments) {
    URL.revokeObjectURL(modalAttachment)
  }
  modalName.value = doc.name;
  modalAuthor.value = (doc.author!=undefined)?doc.author:"";
  if (!Number.isNaN(Number.parseInt(String(doc.team)))) {
    modalTeam.value = Number.parseInt(String(doc.team));
  } else {
    modalTeam.value = undefined;
  }
  modalAttachments.value = []
  let attachments = doc._attachments;
  if (attachments != undefined) {
    let names = Object.keys(attachments)
    for (const name of names) {
      let attachment = (await db.getAttachment(doc._id, name))
      if (attachment instanceof Blob) {
        let file = new File([attachment], name, {type: attachment.type})
        modalAttachments.value.push(URL.createObjectURL(file));
      }
    }
  }
  showModal.value = true;
}
const route = useRoute()
if (!Array.isArray(route.params.id))
  await view(route.params.id)
</script>

<template>
  <ViewAttachment :name="modalName" :author="modalAuthor" :team="modalTeam" :attachments="modalAttachments"/>
</template>

<style scoped>

</style>