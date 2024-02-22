<script setup lang="ts">
</script>

<template>
  <OuterComponents>
    <div class="px-5 max-w-2xl min-w-lg flex-grow">
      <LazyUSkeleton class="w-full h-64 my-5"></LazyUSkeleton>
      <LazyUCard class="my-5">
        <div class="m-1 flex flex-wrap">
          <div class="w-1/2 pr-2.5">
            <LazyUSkeleton class="w-full h-32"></LazyUSkeleton>
          </div>
          <div class="w-1/2 pl-2.5">
            <LazyUSkeleton class="w-full h-32"></LazyUSkeleton>
          </div>
          <div class="w-full py-2.5">
            <LazyUSkeleton class="w-full h-16"></LazyUSkeleton>
          </div>
        </div>
      </LazyUCard>
      <LazyUSkeleton class="w-full h-32 my-5"></LazyUSkeleton>
      <LazyUCard class="my-5">
        <div class="m-1 flex items-center space-x-4">
          <LazyUSkeleton class="h-12 w-12" :ui="{ rounded: 'rounded-full' }" />
          <div class="space-y-2 flex-grow">
            <LazyUSkeleton class="h-4 w-full" />
            <LazyUSkeleton class="h-4 w-full" />
          </div>
        </div>
      </LazyUCard>
    </div>
  </OuterComponents>
</template>

<style scoped>
.app-button-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>