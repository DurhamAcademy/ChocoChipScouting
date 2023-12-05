<script setup lang="ts">
import databases from "~/utils/databases"
import AddButton from "~/components/AddButton.vue";
const { scoutingData } = databases.locals
var columns = [{
  key: '_id',
  label: 'ID'
}, {
  key: 'points',
  label: 'Points',

}]
let db = scoutingData

const matche = (await db.allDocs()).rows
let matc = matche.map(async (doc) => {
  return await db.get(doc.id)
})
let matches = await Promise.all(matc)
columns = Object.keys(matches[0]).map((a)=>{return {key: a, label: a}})
</script>
<template>
  <OuterComponents>
    <UTable :columns="columns" :rows="matches" style="overflow-x: scroll; width: 77vw">
      <template #notes-data="{ row }">
        <UPopover>
          <UButton class="m-1" color="yellow" label="Notes" variant="soft" />
          <template #panel>
            <UCard>
              <div class="max-w-lg min-w-[15rem] overflow-y-auto" style="max-height: 20rem; min-height: 10rem">
                <div class="whitespace-normal break-all">{{row.notes}}</div>
              </div>
            </UCard>
          </template>
        </UPopover>
      </template>
    </UTable>
  </OuterComponents>
</template>
<style scoped>

</style>