<template>
  <div>
    <scroller v-if="get?.content.hero" />
    <product-hero v-if="get?.content.hero" :media="get.content.hero">
      <h1
        v-if="get.content.title"
        class="text-3xl md:text-7xl xl:text-9xl leading-tight xl:leading-snug"
        v-html="get.content.title"
      />
      <div
        v-if="get.content.title"
        class="bg-primary mt-4 mb-8 w-64 md:w-96 xl:w-1/3 h-0.5 md:h-1"
      ></div>
      <p
        v-if="get.content.introduction"
        class="text-lg text-center md:w-2/3 lg:w-1/2 xl:w-2/3 xl:text-2xl xl:leading-normal"
        v-html="get.content.introduction"
      />
    </product-hero>
    <plain-hero v-else>
      <h1
        v-if="get?.content.title"
        class="text-3xl md:text-7xl 2xl:text-9xl leading-tight"
        v-html="get.content.title"
      />
      <div
        v-if="get?.content.title"
        class="bg-primary mt-4 mb-8 w-64 md:w-96 xl:w-1/3 h-0.5 md:h-1"
      ></div>
    </plain-hero>
    <main v-if="get?.content.body" class="content-center my-12 text-white">
      <embedded-content :html="get.content.body" />
    </main>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { Page } from "~~/server/api/ContentTypes";
interface FetchPage {
  content: Page;
}
definePageMeta({
  layout: "content",
});
const route = useRoute();

const slug = ref(String(route.params.page));
const { data: get } = await useFetch<FetchPage>(
  `/api/get/content?slug=${slug.value}`
);
const title = ref(get.value?.content.title);
useHead({
  title: title.value,
  meta: [
    {
      property: 'og:title',
      content: title.value,
    },
    {
      property: 'og:type',
      content: 'page',
    },
    {
      property: 'og:description',
      content: get.value?.content.introduction
    },
    {
      property: 'description',
      content: get.value?.content.introduction
    },
    {
      property: 'og:image',
      content: get.value?.content.hero?.contentType.startsWith('image/') ? get.value?.content.hero?.url : ''
    }
  ],
  bodyAttrs: {
    class: "bg-black",
  },
});
watchEffect(() => {
  refreshNuxtData();
});
</script>
