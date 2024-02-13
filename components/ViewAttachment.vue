<script setup lang="ts">
import {addHook} from "pirates";

const props = defineProps({value: Boolean, name: String, author: String, team: Number, attachments: Array<String>})
</script>

<template>
    <UCard>
      <template #header>
        <div class="flex justify-between">
          <div>
            <h1>{{(name.length==0)?'[No Name]':'Name: '+name}}</h1>
            <h2>{{(team==0)?'[No Team #]':'Team #: '+team}}</h2>
          </div>

          <UPopover mode="hover">
            <UAvatar :alt="author?author:''"/>
            <template #panel>
              <UCard>
                <div class="flex flex-col items-center">
                  <UAvatar :alt="author?author:''" size="xl" class="m-3"/>
                  <H1 class="m-3">{{author}}</H1>
                </div>
              </UCard>
            </template>
          </UPopover>
        </div>
      </template>
      <div class="flex flex-col">
        <NuxtImg v-for="img of attachments" :src="img"/>
      </div>
    </UCard>
</template>

<style scoped>

</style>