<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  params: {
    value: any;
    columnBounds: Map<string, { min: number; max: number }>;
    field: string;
    inverted?: boolean;
    formatter?: (value: number) => string;
    [key: string]: any;
  };
}>();

const value = computed(() => props.params.value);

const columnBounds = computed(() => props.params.columnBounds);
const field = computed(() => props.params.field);
const formatter = computed(() => props.params.formatter);

const formattedValue = computed(() => {
  if (value.value == null || isNaN(value.value)) return 'N/A';
  if (formatter.value) return formatter.value(value.value);
  return value.value.toFixed(1);
});

const percentile = computed(() => {
  if (value.value == null || typeof value.value !== 'number' || isNaN(value.value)) {
    return null;
  }

  if (!columnBounds.value || !field.value) {
    return null;
  }

  const bounds = columnBounds.value.get(field.value);
  if (!bounds) return null;

  const { min, max } = bounds;
  if (max === min) return 50;
  return ((value.value - min) / (max - min)) * 100;
});

const badgeColor = !props.params.inverted ? computed(() => {
  if (percentile.value === null || value.value === -1) {
    return "gray";
  }

  if (percentile.value >= 90) {
    return "blue";
  }
  if (percentile.value >= 200/3) {
    return "green";
  }
  if (percentile.value >= 100/3) {
    return "gray";
  }
  return undefined;
}) : computed(() => {
  if (percentile.value === null) {
    return "gray";
  }

  if (percentile.value <= 10) {
    return "blue";
  }
  if (percentile.value <= 100/3) {
    return "green";
  }
  if (percentile.value <= 200/3) {
    return "gray";
  }
  return undefined;
});
</script>

<template>
  <UBadge
    :label="formattedValue"
    class="rounded-2xl"
    variant="soft"
    :color="badgeColor"
  />
</template>