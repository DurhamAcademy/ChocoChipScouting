<script setup lang="ts">

import {ref} from "vue"
import databases from "~/utils/databases"

const { attachments } = databases.locals
const db = attachments
const route = useRoute()

// display stuff
const attachmentsData = ref<({ attachmentURL: string; attachmentID: string; tagList: string[]; notes: string; fileName: string; fileSize: string; event: string; author: string | undefined; dateUploaded: string; attachmentHovered: boolean})[]>([])
let filteredAttachmentsData = ref<({ attachmentURL: string; attachmentID: string; tagList: string[]; notes: string; fileName: string; fileSize: string; event: string; author: string | undefined; dateUploaded: string; attachmentHovered: boolean})[]>([])
const tempCarouselData = ref<({ attachmentURL: string; attachmentID: string; tagList: string[]; notes: string; fileName: string; fileSize: string; event: string; author: string | undefined; dateUploaded: string; attachmentHovered: boolean})[]>([])
let attachmentsURLs = ref<string[]>([])
const displayURLs = ref<string[]>([])
const possibleTags = ref<string[]>([])
const tagStyles = ref<string[]>([])
const attachmentHovered = ref(attachmentsData.value.map(() => false)) // creates a list of bools for each of the attachments (all set to false because none are being hovered)
const openCarousel = ref(false)

// filters
const filterTags = ref<string[]>([])
const filterInput = ref<string>('')

let allDocs = await db.allDocs({ include_docs: true })
// filter attachments by team #
allDocs.rows.forEach(async (row) => {
  const doc = row.doc;
  if (doc)
    if (doc._attachments && doc.teamNumber.toString() == route.params.id) {
      // Process the attachments for this document
      let attachment = await (db.getAttachment(doc._id, doc.name))
      if (attachment instanceof Blob) {
        let file = new File([attachment], doc.name, {type: attachment.type})

        attachmentsData.value.push({ attachmentURL: URL.createObjectURL(file), attachmentID: doc._id, tagList: doc.tags, notes: doc.extraNotes, fileName: doc.name, fileSize: doc.fileSize, event: doc.event, author: doc.author, dateUploaded: doc.dateUploaded, attachmentHovered: false})
        for (let tag of attachmentsData.value[attachmentsData.value.length-1].tagList) {
          if(!possibleTags.value.includes(tag)) {
            possibleTags.value.push(tag)
            tagStyles.value.push("outline")
          }
        }
      }

    }
});
filteredAttachmentsData.value = attachmentsData.value

// updating stuff when values change
attachmentsURLs = computed(() => {
  return attachmentsData.value.map(item => item.attachmentURL)
})
filteredAttachmentsData = computed(() => {
  return attachmentsData.value.filter(attachment => {
    return attachment.notes.toLowerCase().includes(filterInput.value.toLowerCase());
  }).filter(attachment => {
    return filterTags.value.every(tag => attachment.tagList.includes(tag))
  })
})

// changes tag variant of tag clicked and also adds/removes tag to filter tags
function toggleTag(index: number) {
  if (tagStyles.value[index] == "outline") {
    filterTags.value.push(possibleTags.value[index])
    tagStyles.value[index] = "solid"
  } else if (tagStyles.value[index] == "solid"){
    filterTags.value.splice(filterTags.value.indexOf(possibleTags.value[index]))
    tagStyles.value[index] = "outline"
  }
}

// sets image clicked on as the first image in the carousel and makes sure that carousel data is parallel to displayURLs array
function showCarousel(index: number) {
  displayURLs.value = [...attachmentsURLs.value]
  tempCarouselData.value = [...attachmentsData.value]
  const temp = displayURLs.value.splice(index, 1)[0]
  const temp2 = tempCarouselData.value.splice(index, 1)[0]
  displayURLs.value.unshift(temp)
  tempCarouselData.value.unshift(temp2)
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
          <UInput placeholder="Filter Notes" icon="i-heroicons-magnifying-glass" class="w-40" v-model="filterInput"/> <!-- wip -->
          <UPopover class="px-2">
            <UButton label="Filter Tags" trailing-icon="i-heroicons-adjustments-horizontal" variant="ghost"/>
            <template #panel>
              <UCard class="min-w-32 max-w-64 flex flex-wrap justify-center">
                <template #header>
                  <h1>Choose Tags To Filter</h1>
                </template>
                <template #default>
                  <UButton v-for="(tag, index) in possibleTags" :label="tag" class="flex-grow justify center" style="margin:5px" :variant="tagStyles[index]" :ui="{ rounded: 'rounded-full' }" @click="toggleTag(index)"/>
                </template>
              </UCard>
            </template>
          </UPopover>
        </div>
      </div>
    </template>
    <template class="flex flex-wrap justify-center">
      <UModal v-model="openCarousel" fullscreen >
        <UButton color="gray" icon="i-heroicons-x-mark" size="xl" class="absolute right-2 top-2" variant="ghost" @click="openCarousel=false "/>
          <UCarousel
              v-slot="{ item, index }"
              :items="displayURLs"
              :ui="{
        item: 'basis-full justify-center',
        container: 'rounded-lg bg-gray-100'

      }"
              :prev-button="{
        color: 'gray',
        icon: 'i-heroicons-arrow-left-20-solid',
        class: 'left-6'
      }"
              :next-button="{
        color: 'gray',
        icon: 'i-heroicons-arrow-right-20-solid',
        class: 'right-6'
      }"
              arrows
              class="w-full h-11/12 m-auto"
          >

            <NuxtImg :src="item" draggable="false" class="object-contain overflow-hidden" />
            <UCard class="bg-white rounded-2xl m-2 lg:min-w-64 md:min-w-48 min-w-24 overflow-hidden">
              <template #header class="flex flex-wrap">
                <div class="font-sans text-2xl flex flex-wrap" >
                  <h1 v-if="tempCarouselData[index].notes != ''" >{{ tempCarouselData[index].notes }}</h1>
                  <h1 v-else class="opacity-50">No Notes</h1>
                </div>
              </template>
              <template class="flex flex-wrap">
                <UBadge v-if="tempCarouselData[index].tagList.length != 0" v-for="tag in tempCarouselData[index].tagList" :label="tag" class="bg-gray-500 m-0.5 rounded-2xl h-7 px-3" variant="solid"/>
                <h1 v-else class="font-sans text-lg opacity-50">No Tags</h1>
              </template>
              <template #footer>
                <div class="font-sans text-xs opacity-35">
                  <p>Event: {{tempCarouselData[index].event}}</p>
                  <p>Author: {{tempCarouselData[index].author}}</p>
                  <p>Date Uploaded: {{tempCarouselData[index].dateUploaded}}</p>
                </div>
              </template>
            </UCard>
          </UCarousel>
      </UModal>
      <UContainer v-if="filteredAttachmentsData.length != 0" v-for="(attachment, index) in filteredAttachmentsData" :key="index"  class="m-2 bg-cover bg-center min-w-60 w-1/4 h-80 rounded-2xl md:px-0 lg:px-0 sm:px-0 px-0 flex flex-col justify-end" :style="{ backgroundImage: 'url(' + attachment.attachmentURL + ')'}" @mouseover="attachmentHovered[index] = true" @mouseleave="attachmentHovered[index] = false" @click="showCarousel(index)">
          <UContainer v-show="attachmentHovered[index]" class="lg:px-0 sm:px-0 px-0 m-0 h-30 max-w-7xl ">
            <UCard class="rounded-t-none rounded-b-2xl bg-white" :style="{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }">
                <div class="flex flex-wrap">
                  <div class="font-sans text-2xl flex flex-wrap" >
                    <h1 v-if="attachment.notes != ''" >{{ attachment.notes }}</h1>
                    <h1 class="opacity-50" v-else>No Notes</h1>
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
      <p v-else class="font-sans text-lg font-bold opacity-70">Placeholder for sad not found cookie image or something</p>
    </template>
  </UCard>
</template>

<style scoped>

</style>