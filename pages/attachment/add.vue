<script lang="ts" setup>
import Compressor from 'compressorjs';
import { useDropZone, useFileDialog } from '@vueuse/core';
import Navbar from '~/components/website-utils/Navbar.vue';
import LoginState from '~/utils/authorization/LoginState';
import databases from '~/utils/databases';
import heic2any from 'heic2any';
import { NuxtImg } from '#components';
import { eventOptions } from '~/utils/eventOptions';

const { attachments } = databases.databases;
const db = attachments.local;
const date = new Date().toDateString();

const dropZoneRef = ref<HTMLDivElement>();
const tagsList = ['robot', 'person', 'strategy', 'auto', 'logo', 'food']; //idk what tags would be good

let selectedEvent = eventOptions[0];
if (typeof window !== 'undefined')
  selectedEvent = localStorage.getItem('currentEvent') || eventOptions[0];

let fileList = ref<(File | Blob)[]>([]);
let nameList = ref<String[]>([]);
let rows = ref<
  {
    fileName: string;
    fileType: string;
    fileSize: string;
    photoURL: string;
    teamNumber: number;
    tags: string[];
    tagStyle: string[];
    extraNotes: string;
    dateUploaded: string;
  }[]
>([]);

let tagStyles = Array(tagsList.length);
for (let i = 0; i < tagStyles.length; i++) {
  tagStyles[i] = 'outline';
}

async function onDrop(files: File[] | null) {
  // dropbox
  imageProcessor(files);
}

const { files, open, reset, onChange } = useFileDialog({
  accept: 'image/*,.heic',
});
// if a file has been chosen by useFileDialog
onChange(files => {
  if (files) {
    const fileArray: File[] = Array.from(files);
    imageProcessor(fileArray);
  }
});

async function resetPage() {
  fileList.value = [];
  nameList.value = [];
  rows.value = [];
}
// processes images from the useFileDialog/dropbox
async function imageProcessor(files: File[] | null) {
  if (files)
    if (rows.value.length <= 25)
      for (let i = 0; i < files.length; i++) {
        try {
          let file = files[i];
          let currentFile = file!;
          let realFileType = currentFile.type;

          if (
            !(
              currentFile.type.match('image/.+') ||
              currentFile.type.match('.heic')
            )
          )
            throw new Error('Filetype is not accepted');
          if (currentFile.type.match('image/heic')) {
            currentFile = await heic2any({
              blob: currentFile,
              toType: 'image/jpeg',
            });
            realFileType = 'image/heic';
          }
          new Compressor(currentFile, {
            maxHeight: 1080,
            maxWidth: 1080,
            quality: 0.5,
            convertSize: 10000000,
            convertTypes: [],
            success(newFile: File | Blob) {
              fileList.value?.push(newFile);
              let fileSize = (currentFile.size / (1024 * 1024)).toFixed(2);
              rows.value.push({
                fileName: file.name,
                fileType: realFileType,
                fileSize: fileSize + ' MB',
                photoURL: URL.createObjectURL(currentFile),
                teamNumber: -1,
                tags: new Array(tagsList.length),
                tagStyle: tagStyles.map(item => {
                  return item;
                }),
                extraNotes: '',
                dateUploaded: date,
              });
            },
          });
        } catch (e) {
          console.log(e);
        }
      }
}

let {
  usernameState,
  logout,
}: {
  loginState: LoginState;
  usernameState: globalThis.Ref<string | undefined>;
  updateUsernameState: () => Promise<void>;
  logout: () => Promise<void>;
} = inject(loginStateKey)!;

async function submit() {
  for (let i = 0; i < rows.value.length; i++) {
    const docObject = {
      event: selectedEvent,
      name: rows.value[i].fileName,
      teamNumber: rows.value[i].teamNumber,
      fileSize: rows.value[i].fileSize,
      author: usernameState.value,
      tags: rows.value[i].tags.filter(str => str.trim() !== ''),
      extraNotes: rows.value[i].extraNotes,
      dateUploaded: rows.value[i].dateUploaded,
    };
    let doc = await db.post(docObject);
    console.info(doc);
    let rev = doc.rev;
    let v = rows.value[i].fileName;
    console.info(i, rev);
    let result = await db.putAttachment(
      doc.id,
      v,
      rev,
      fileList.value[i],
      fileList.value[i].type,
    );
    console.info(rev);
    rev = result.rev;
  }
  attachments.sync();
  resetPage();
}

function toggleTag(index: number, indexOfTag: number) {
  if (rows.value[index].tagStyle[indexOfTag] == 'outline') {
    rows.value[index].tags[indexOfTag] = tagsList[indexOfTag];
    rows.value[index].tagStyle[indexOfTag] = 'solid';
  } else if (rows.value[index].tags[indexOfTag] == tagsList[indexOfTag]) {
    rows.value[index].tags[indexOfTag] = '';
    rows.value[index].tagStyle[indexOfTag] = 'outline';
  }
}

function minMaxTeam(index: number) {
  if (rows.value[index].teamNumber > 9999 || rows.value[index].teamNumber < -1)
    rows.value[index].teamNumber = -1;
}

function changeAllTeams(index: number) {
  for (let i = 0; i < rows.value.length; i++) {
    rows.value[i].teamNumber = rows.value[index].teamNumber;
  }
}

const { isOverDropZone } = useDropZone(dropZoneRef, onDrop); // variable that checks if file is being dragged over dropbox
</script>

<template>
  <navbar></navbar>
  <UContainer>
    <UCard
      class="w-lg h-96 flex flex-wrap justify-center content-center m-3 transition-colors"
      :class="{ 'bg-emerald-100': isOverDropZone }"
      ref="dropZoneRef"
    >
      <template #header>Drop files here</template>
      <UButton
        type="button"
        @click="open"
        label="Choose file"
        variant="ghost"
      />
      <template #footer>
        <UButton
          type="button"
          @click="submit"
          label="Submit"
        />
      </template>
    </UCard>
    <UCard class="m-3">
      <UTable
        :rows="rows"
        :columns="[
          { key: 'fileName', label: 'File Name' },
          { key: 'fileType', label: 'File Type' },
          { key: 'fileSize', label: 'File Size' },
          { key: 'teamNum', label: 'Team # (0 for misc)' },
          { key: 'tags', label: 'Tags' },
          { key: 'actions' },
        ]"
      >
        <template #teamNum-data="{ row, index }">
          <div class="flex">
            <UInput
              class="min-w-20"
              v-model="row.teamNumber"
              placeholder="Team #"
              type="number"
              @change="minMaxTeam(index)"
            />
            <UTooltip text="Apply team # to all">
              <UButton
                @click="changeAllTeams(index)"
                icon="i-heroicons-arrows-up-down"
                style="margin-left: 5px"
                variant="ghost"
              />
            </UTooltip>
          </div>
        </template>
        <template #tags-data="{ row, index }">
          <UPopover>
            <UButton
              label="+ Add Tags"
              variant="ghost"
            />
            <template #panel>
              <div class="flex-wrap flex max-w-64 justify-center">
                <UButton
                  v-for="tag in tagsList"
                  :label="tag"
                  style="margin: 5px"
                  :variant="row.tagStyle[tagsList.indexOf(tag)]"
                  :ui="{ rounded: 'rounded-full' }"
                  @click="toggleTag(index, tagsList.indexOf(tag))"
                  class="flex-grow justify-center"
                />
              </div>
            </template>
          </UPopover>
        </template>
        <template #actions-data="{ row, index }">
          <div style="display: flex; align-items: center">
            <UTooltip
              text="Extra Notes"
              :popper="{ placement: 'left' }"
            >
              <UPopover>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-pencil-square"
                />
                <template #panel>
                  <UTextarea v-model="row.extraNotes" />
                </template>
              </UPopover>
            </UTooltip>
            <UPopover
              mode="hover"
              :popper="{ placement: 'left-end' }"
            >
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-eye"
              />
              <template #panel="{ close }">
                <NuxtImg
                  :src="row.photoURL"
                  class="h-48 w-100"
                  alt="Selected Image"
                  @mouseenter="close"
                />
              </template>
            </UPopover>
            <UButton
              color="red"
              variant="ghost"
              icon="i-heroicons-trash"
              @click="rows.splice(index, 1)"
            />
          </div>
        </template>
      </UTable>
    </UCard>
  </UContainer>
</template>

<style scoped />
