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
const tagsList = ["robot", "person", "strategy"] //idk what tags would be good

let fileList = ref<(File|Blob)[]>([])
let nameList = ref<(String)[]>([])
let rows = ref<({ size: string; name: string; type: string; photoURL: string; teamNumber: number, tags: string[]; tagStyle: string[], extraNotes: string})[]>([])

let tagStyles = Array(tagsList.length)
for (let i = 0; i < tagStyles.length; i++) {
  tagStyles[i] = "outline"
}

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
}
// processes images from the useFileDialog/dropbox
async function imageProcessor(files: File[] | null) {
  if (files)
    if (rows.value.length <= 25)
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
              rows.value.push({size: fileSize+" MB", name: file.name, type: realFileType, photoURL: URL.createObjectURL(currentFile), teamNumber: 0, tags: new Array(tagsList.length), tagStyle: tagStyles.map(item =>  { return item }), extraNotes: "" })
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

function toggleTag(index: number, indexOfTag: number) {
  if (rows.value[index].tagStyle[indexOfTag] == "outline") {
    rows.value[index].tags[indexOfTag] = tagsList[indexOfTag]
    rows.value[index].tagStyle[indexOfTag] = "solid"
  } else if (rows.value[index].tags[indexOfTag] == tagsList[indexOfTag]){
    rows.value[index].tags[indexOfTag] = ""
    rows.value[index].tagStyle[indexOfTag] = "outline"
  }
}

function minMaxTeam(index: number ) {
  if (rows.value[index].teamNumber > 9999)
    rows.value[index].teamNumber = 9999
  else if (rows.value[index].teamNumber < 0)
      rows.value[index].teamNumber = 0
}

const {isOverDropZone} = useDropZone(dropZoneRef, onDrop) // variable that checks if file is being dragged over dropbox

</script>

<template>
  <navbar></navbar>
  <UContainer>
    <UCard class="w-lg h-96 flex flex-wrap justify-center content-center m-3 transition-colors" :class="{'bg-emerald-100': isOverDropZone}" ref="dropZoneRef">
      <template #header>Drop files here</template>
        <UButton type="button" @click="open" label="Choose file" variant="ghost"/>
      <template #footer>
        <UButton type="button" @click="submit" label="Submit"/>
      </template>
    </UCard>
    <UCard class="m-3">
      <UTable :rows="rows" :columns="[{key: 'size', label: 'File Size'}, {key: 'name', label: 'File Name'}, {key: 'type', label: 'File Type'}, {key: 'teamNum', label: 'Team #'}, {key: 'tags', label: 'Tags'}, {key: 'actions'}]">
        <template #teamNum-data="{ row, index }">
          <UInput v-model="row.teamNumber" placeholder="Team #" type="number" @change="minMaxTeam(index)"/>
        </template>
        <template #tags-data="{ row, index }">
          <UPopover>
            <UButton label="+ Add Tags" variant="ghost"/>
            <template #panel>
              <div class="flex-wrap flex max-w-64 justify-center">
                <UButton v-for="tag in tagsList" :label="tag" style="margin:5px" :variant="row.tagStyle[tagsList.indexOf(tag)]" :ui="{ rounded: 'rounded-full' }" @click="toggleTag(index, tagsList.indexOf(tag))" class="flex-grow justify-center"/>
              </div>
            </template>
          </UPopover>
        </template>
        <template #actions-data="{ row, index }">
          <div style="display: flex; align-items: center">
            <UPopover>
              <UTooltip text="Extra Notes">
                <UButton color="gray" variant="ghost" icon="i-heroicons-pencil-square"/>
                <template #panel>
                  <UTextarea v-model="row.extraNotes"/>
                </template>
              </UTooltip>
            </UPopover>
            <UPopover mode="hover" :popper="{ placement: 'left-end'}">
              <UButton color="gray" variant="ghost" icon="i-heroicons-eye"/>
              <template #panel=" { close }">
                <img :src="row.photoURL" class="h-48 w-100" alt="Selected Image" @mouseenter="close"/>
              </template>
            </UPopover>
            <UButton color="red" variant="ghost" icon="i-heroicons-trash" @click="rows.splice(index, 1)"/>
          </div>
        </template>
      </UTable>
    </UCard>
  </UContainer>
</template>

<style scoped/>