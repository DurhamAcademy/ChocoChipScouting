<script setup lang="ts">
//a component that allows the user to see if their data has synced with the database
import SyncStatusVisualization from '~/components/website-utils/SyncStatusVisualization.vue';
import OuterComponents from '~/components/website-utils/OuterComponents.vue';

//allows the user to switch between light and dark mode
const colorMode = useColorMode();
/**
 * A computed variable that determines if the website mode is dark or light.
 *
 * @type {boolean}
 */
const isDark = computed({
  get() {
    return colorMode.value === 'dark';
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  },
});
</script>

<template>
  <OuterComponents>
    <div class="flex justify-center">
      <UCard class="max-w-xl mt-5 flex-grow">
        <UFormGroup
          class="inline-block inputDiv mb-2"
          label="Style"
        >
          <ClientOnly>
            <UButton
              :icon="
                isDark
                  ? 'i-heroicons-moon-20-solid'
                  : 'i-heroicons-sun-20-solid'
              "
              color="gray"
              variant="ghost"
              label="Theme"
              @click="isDark = !isDark"
            />
          </ClientOnly>
        </UFormGroup>
        <UAccordion
          variant="soft"
          size="sm"
          :items="[{ label: 'Debug Menu', slot: 'debug' }]"
        >
          <template #debug>
            <SyncStatusVisualization />
          </template>
        </UAccordion>
      </UCard>
    </div>
  </OuterComponents>
</template>

<style scoped></style>
