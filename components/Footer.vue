<template>
  <footer
    class="bg-neutral flex flex-col px-4 md:px-16 2xl:px-32 pt-4 lg:pt-12 pb-10 border-t border-gray text-white"
  >
    <div class="flex space-x-4 lg:space-x-8 flex-wrap justify-start">
      <div class="sm:border-r sm:border-gray w-full sm:w-1/2 lg:flex-1">
        <nuxt-img
          provider="contentful"
          v-if="logoItems && logoItems.length"
          :src="logoItems[0].image?.url"
          class="invert w-24"
          sizes="xs:96px"
        />
      </div>
      <div class="border-r border-gray pr-4 sm:pr-0 sm:w-28 lg:w-32">
        <h2 class="text-sm xl:text-lg font-bold">Navigation</h2>
        <nuxt-link
          class="block hover:text-gray pt-3 text-xs xl:text-base"
          v-for="(item, ind) in navItems"
          :class="{ 'border-b-0': ind === (navItems || []).length - 1 }"
          :key="ind"
          :to="item.item ? `/${item.item.slug || ''}` : ''"
          :prefetch="false"
          >{{ item.label }}</nuxt-link
        >
      </div>
    </div>
  </footer>
</template>
<script lang="ts" setup>
import { Navigation } from "~~/server/api/ContentTypes";
interface FetchContent {
  content: Navigation[];
}
// get the navigation based on navigation content type to populate the footer
const { data: nav } = await useFetch<FetchContent>("/api/get/navigation");
const navItems = nav.value?.content
  .filter((item) => item.type === "Link" || !item.type)
  .sort((a, b) => a.order - b.order);
const logoItems = nav.value?.content
  .filter((item) => item.type === "Logo")
  .sort((a, b) => a.order - b.order);
</script>
