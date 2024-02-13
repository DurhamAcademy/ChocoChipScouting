<script setup lang="ts">

import {ref} from "vue"
import databases from "~/utils/databases"

const { attachments } = databases.locals
const db = attachments
const attachmentsData = ref<({ attachmentURL: string; attachmentID: string; tagList: string[]; notes: string; fileName: string; fileSize: string; event: string; author: string | undefined; dateUploaded: string})[]>([])
let attachmentsURLs = ref<string[]>([])
const route = useRoute()
const attachmentHovered = ref(attachmentsData.value.map(() => false))
const openCarousel = ref(false)

let carouselImages = []

let alldocs = await db.allDocs({ include_docs: true })
  // Filter attachments by key
  alldocs.rows.forEach(async (row) => {
    const doc = row.doc;
    if (doc)
      if (doc._attachments && doc.teamNumber.toString() == route.params.id) {
        // Process the attachments for this document
        let attachment = await (db.getAttachment(doc._id, doc.name))
        if (attachment instanceof Blob) {
          let file = new File([attachment], doc.name, {type: attachment.type})

          attachmentsData.value.push({ attachmentURL: URL.createObjectURL(file), attachmentID: doc._id, tagList: doc.tags, notes: doc.extraNotes, fileName: doc.name, fileSize: doc.fileSize, event: doc.event, author: doc.author, dateUploaded: doc.dateUploaded})
        }

      }
  });
watchEffect(() => {
  attachmentsURLs.value = attachmentsData.value.map(item => item.attachmentURL);
})
console.log(attachmentsURLs)

function updateAttachmentNote(index: number, note: string) {
  if (attachmentsData.value[index].notes === "")
    attachmentsData.value[index].notes = "No Notes"
  else
    attachmentsData.value[index].notes = note
}

let team = "Team " + route.params.id + " Attachments"

function showCarousel() {
  carouselImages = attachmentsURLs.value
  openCarousel.value = true
}


</script>

<template>
  <UCard>
    <template #header>
      <Title>Team {{ route.params.id }} | Attachments</Title>
      <div>
        <h1 class="font-extrabold text-4xl">Team {{ route.params.id }} Attachments</h1>
        <div class="flex mt-2">
          <UInput placeholder="Filter Notes" icon="i-heroicons-magnifying-glass" class="w-40"/> <!-- wip -->
          <UPopover class="px-2">
            <UButton label="Filter Tags" trailing-icon="i-heroicons-adjustments-horizontal" variant="ghost"/> <!-- also wip-->
            <template #panel>

            </template>
          </UPopover>
        </div>
      </div>
    </template>
    <template class="flex flex-wrap justify-center">
      <UModal v-model="openCarousel" fullscreen >
        <UButton color="gray" icon="i-heroicons-x-mark" size="xl" class="absolute right-2 top-2" variant="ghost" @click="openCarousel=false"/>
          <UCarousel
              v-slot="{ item, index }"
              :items="attachmentsURLs"
              :ui="{
        item: 'basis-full justify-center',
        container: 'rounded-lg bg-gray-100'

      }"
              :prev-button="{
        color: 'gray',
        icon: 'i-heroicons-arrow-left-20-solid',
        class: '-left-12'
      }"
              :next-button="{
        color: 'gray',
        icon: 'i-heroicons-arrow-right-20-solid',
        class: '-right-12'
      }"
              arrows
              class="w-11/12 h-11/12 m-auto"
          >
              <NuxtImg :src="item" draggable="false" class="object-contain"/>
              <UCard class="bg-white rounded-2xl m-2 min-w-64 ">
                <template #header class="flex flex-wrap">
                  <div class="font-sans text-2xl flex flex-wrap" >
                    <h1 v-if="attachmentsData[index].notes != ''" >{{ attachmentsData[index].notes }}</h1> <!-- push contents to the database -->
                    <h1 class="opacity-50" v-else>No Notes</h1> <!--fix this horrendous pile of shit-->
                  </div>
                </template>
                <template class="flex flex-wrap">
                  <UBadge v-if="attachmentsData[index].tagList.length != 0" v-for="tag in attachmentsData[index].tagList" :label="tag" class="bg-gray-500 m-0.5 rounded-2xl h-7 px-3" variant="solid"/>
                  <h1 v-else class="font-sans text-lg opacity-50">No Tags</h1>
                </template>
                <template #footer>
                  <div class="font-sans text-xs opacity-35">
                    <p>Name: {{attachmentsData[index].fileName}}</p>
                    <p>Size: {{attachmentsData[index].fileSize}}</p>
                    <p>Event: {{attachmentsData[index].event}}</p>
                    <p>Author: {{attachmentsData[index].author}}</p>
                    <p>Date Uploaded: {{attachmentsData[index].dateUploaded}}</p>
                  </div>
                </template>
              </UCard>
          </UCarousel>
      </UModal>
      <UContainer v-for="(attachment, index) in attachmentsData" :key="index"  class="m-2 bg-cover bg-center min-w-60 w-1/4 h-80 rounded-2xl md:px-0 lg:px-0 sm:px-0 px-0 flex flex-col justify-end" :style="{ backgroundImage: 'url(' + attachment.attachmentURL + ')'}" @mouseover="attachmentHovered[index] = true" @mouseleave="attachmentHovered[index] = false" @click="showCarousel">
          <UContainer v-show="attachmentHovered[index]" class="lg:px-0 sm:px-0 px-0 m-0 h-30 max-w-7xl ">
            <UCard class="rounded-t-none rounded-b-2xl bg-white" :style="{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }">
                <div class="flex flex-wrap">
                  <div class="font-sans text-2xl flex flex-wrap" >
                    <h1 v-if="attachment.notes != ''" >{{ attachment.notes }}</h1> <!-- push contents to the database -->
                    <h1 class="opacity-50" v-else>No Notes</h1> <!--fix this horrendous pile of shit-->
                  </div>

                  <!--
                  <UPopover>
                    <UButton icon="i-heroicons-pencil-square" variant="ghost" color="gray" class="ml-1"/>
                    <template #panel>
                      <UInput :model-value="attachment.notes" @change=""/>
                    </template>
                  </UPopover>
                  -->
                </div>
              <div class="flex flex-wrap">
                <UBadge v-for="tag in attachment.tagList" :label="tag" class="bg-gray-500 m-0.5 rounded-2xl h-7 px-3" variant="solid"/>
                <!--
                <UPopover>
                  <UButton icon="i-heroicons-tag" variant="ghost" color="gray" class="ml-1"/>
                  <template #panel>
                     add or remove tags
                  </template>
                </UPopover>
                -->
              </div>
            </UCard>
          </UContainer>
      </UContainer>
    </template>
  </UCard>
</template>

<style scoped>

</style>