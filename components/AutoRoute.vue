<script setup lang="ts">
import { computed } from 'vue'
const emit = defineEmits(['update:modelValue'])
const props = defineProps<{
  modelValue: Array<String>
}>()
let fullArray = [["f1", "f2", "f3", "f4"],["m1", "m2", "m3", "m4"],["c1", "c2", "c3", "c4"],["s1", "s2", "s3", "s4"]]
    //f = front m = middle c = climb s = speaker
let isOpen = ref(false)
let cQ: string
let endResult: ArrayList<String>
let eZ=false, cN=false, dN=false, sNM=false, sAM=false, sNS=false, sAS=false
//currentQuadrant

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

function addResults(Quadrant:string){
  let temp = Quadrant
  if(eZ){
    temp = temp + " eZ"
  }
  if(cN){
    temp = temp + " cN"
  }
  if(dN){
    temp = temp + " dN"
  }
  if(sNM){
    temp = temp + " sNM"
  }
  if(sAM){
    temp = temp + " sAM"
  }
  if(sNS){
    temp = temp + " sNS"
  }
  if(sAS){
    temp = temp + " sAS"
  }
  if(temp!=Quadrant) {
    endResult.add(temp)
  }
}

</script>

<template>
  <div>
    <div v-for="items in fullArray" class="flex" flex-auto>
      <div v-for="item in items" @click="isOpen = true, cQ=item" class="flex-auto w-1/4 h-1/4">
        <p>{{item}}</p>
        <br>
      </div>
    </div>
    <UModal v-model="isOpen">
      <div class="flex flex-auto">
        <div class="p-4">
          <div class="h-72">
            <BooleanButton label="Entered Zone" @click="eZ=!eZ"/>
            <BooleanButton label="Collected Note" @click="cN=!cN"/>
            <BooleanButton label="Discarded Note" @click="dN=!dN"/>
            <br>
            <BooleanButton label="Shot Note (Missed)" @click="sNM=!sNM"/>
            <BooleanButton label="Shot Amp (Missed)" @click="sAM=!sAM"/>
            <br>
            <BooleanButton label="Shot Note (Scored)" @click="sNS=!sNS"/>
            <BooleanButton label="Shot Amp (Scored)" @click="sAS=!sNS"/>
            <br>
            <BooleanButton label="unused Button" @click=""/>
            <BooleanButton label="unused Button" @click=""/>
            <UButton @click="addResults(cQ), isOpen=false" icon="i-heroicons-x-circle" class="flex justify-end justify-right"/>
            </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

<style scoped>

</style>