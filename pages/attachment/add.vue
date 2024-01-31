<script lang="ts"
        setup>

import AddButton from "~/components/AddButton.vue";
import Compressor from "compressorjs";
import {useDropZone, useFileDialog} from '@vueuse/core'
import LoginState from "~/utils/authorization/LoginState";
import databases from "~/utils/databases"
import heic2any from "heic2any"

const { attachments } = databases.databases
const db = attachments.local;

const dropZoneRef = ref<HTMLDivElement>()
const AttachmentName = ref("")
const TeamNumber = ref(0)

let fileList = ref<(File|Blob)[]>([])
let nameList = ref<(String)[]>([])
let rows = ref<({ size: string; name: string; type: string; photoURL: string })[]>([])
async function onDrop(files: File[] | null) { // dropbox
  imageProcessor(files)
}

const { files, open, reset, onChange } = useFileDialog({
  accept: 'image/*,.heic'
})
// if a file has been chosen by useFileDialog
onChange((files) => {
  if (files) {
    const fileArray: File[] = Array.from(files);
    imageProcessor(fileArray)
  }
})

async function resetPage() {
  fileList.value = []
  nameList.value = []
  rows.value = []
  AttachmentName.value = ""
  TeamNumber.value = 0
}
// processes images from the useFileDialog/dropbox
async function imageProcessor(files: File[] | null) {
  if (files)
    for (let i = 0; i < files.length; i++) {
      try {
        let file = files[i]
        let currentFile = file!
        let realFileType = currentFile.type

        if (!(currentFile.type.match('image/.+') || currentFile.type.match('.heic')))
          throw new Error('Filetype is not accepted')
        if(currentFile.type.match('image/heic')) {
          currentFile = await heic2any({
            blob: currentFile,
            toType: "image/jpeg"
          })
          realFileType = "image/heic"
        }
        new Compressor(currentFile, {
          maxHeight: 1080,
          maxWidth: 1080,
          quality: 0.5,
          convertSize: 10000000,
          convertTypes: [],
          success(newFile: File | Blob) {
            fileList.value?.push(newFile)
            nameList.value.push(currentFile.name)
            let fileSize = (currentFile.size / (1024 * 1024)).toFixed(2)
            rows.value.push({size: fileSize+" MB", name: file.name, type: realFileType, photoURL: URL.createObjectURL(currentFile)});
          }
        })
      }
      catch(e) {
        console.log(e)
      }
    }
}

var {usernameState, logout}: {
  loginState: LoginState;
  usernameState: globalThis.Ref<string | undefined>;
  updateUsernameState: () => Promise<void>;
  logout: () => Promise<void>
} = inject(loginStateKey)!

async function submit() {
  const docObject = {
    name: AttachmentName.value,
    team: TeamNumber.value,
    author: usernameState.value
  };
  console.log(docObject)
  let doc = await db.post(docObject)
  console.info(doc)
  var rev=doc.rev;
  for (let i = 0; i < fileList.value.length; i++) {
    var v = nameList.value.at(i)
    if (v != undefined) {
      console.info(i, rev)
      var result = await db.putAttachment(doc.id, v.valueOf(), rev, fileList.value[i], fileList.value[i].type)
      console.info(rev)
      rev = result.rev
      // TODO: notes mid match
    }
  }
  await attachments.sync();
  resetPage()
}

const {isOverDropZone} = useDropZone(dropZoneRef, onDrop) // variable that checks if file is being dragged over dropbox

</script>

<template>
  <navbar></navbar>
  <UContainer>
    <UFormGroup class="m-3" label="Attachment Name" required>
      <UInput v-model="AttachmentName" placeholder="Robot Photo!" required/>
    </UFormGroup>
    <UFormGroup class="m-3" label="Team Number">
      <UInput v-model="TeamNumber"  placeholder="6502" type="number"/>
    </UFormGroup>
    <UCard class="w-lg h-96 flex flex-wrap justify-center content-center m-3 transition-colors" :class="{'bg-emerald-100': isOverDropZone}" ref="dropZoneRef">
      <template #header>Drop files here</template>
        <UButton type="button" @click="open" label="Choose file" variant="ghost"/>
      <template #footer>
        <UButton type="button" @click="submit" label="Submit"/>
      </template>
    </UCard>
    <UCard class="m-3">
      <UTable :rows="rows" :columns="[{key: 'size', label: 'File Size'}, {key: 'name', label: 'File Name'}, {key: 'type', label: 'File Type'}, {key: 'actions'}]">
        <template #actions-data="{ row, index }">
          <div style="display: flex; align-items: center;">
            <UPopover mode="hover" :popper="{ placement: 'left-end'}">
              <UButton color="gray" variant="ghost" icon="i-heroicons-eye"/>
              <template #panel>
                <img :src="row.photoURL" class="h-48 w-100" alt="Selected Image" />
              </template>
            </UPopover>
            <UButton color="gray" variant="ghost" icon="i-heroicons-trash" @click="rows.splice(index, 1)"/>
          </div>
        </template>
      </UTable>
    </UCard>
  </UContainer>
  <AddButton/>
</template>

<style scoped/>