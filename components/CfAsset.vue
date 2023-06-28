<template>
  <div>
    <nuxt-img
      provider="contentful"
      v-if="imgTypes.includes(type)"
      :src="source"
      :alt="description"
      sizes="xs:100vw sm:50vw md:50vw lg:50vw"
    />
    <video
      class="w-full h-auto"
      v-else-if="vidTypes.includes(type)"
      autoplay
      loop
      muted
      playsinline
    >
      <source :src="source" />
    </video>
  </div>
</template>
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    source: string;
    type: string;
    description?: string;
  }>(),
  {
    description: "",
  }
);
const imgTypes = ["image/bmp", "image/jpeg", "image/x-png", "image/png", "image/gif"];
const vidTypes = ["video/mp4"];
</script>
