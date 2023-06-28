<template>
  <nav
    class="sticky bg-black transition-all z-40 top-0 px-6 lg:px-10 py-6 flex w-screen h-24 justify-between items-center lg:justify-evenly"
    :class="{ 'bg-opacity-100': scrolling, 'bg-opacity-0': !scrolling }"
  >
    <aside class="absolute left-6 z-20 w-16 xl:ml-12">
      <NuxtLink
        v-for="(item, ind) in logoItems"
        :key="ind"
        :to="item.item ? item.item.slug || '/' : ''"
        :prefetch="false"
        ><nuxt-img provider="contentful" :src="item.image?.url" class="invert w-16"
      /></NuxtLink>
    </aside>
    <div class="absolute right-6 z-20 cursor-pointer lg:hidden" @click="toggleMenu">
      <nuxt-img v-if="!menuVisible" src="/img/menu.svg" />
      <nuxt-img v-else src="/img/close.svg" />
    </div>
    <div
      @click="hideMenu"
      class="whitespace-nowrap bg-black transition-all lg:translate-x-0 lg:bg-transparent flex flex-col lg:flex-row absolute z-10 lg:relative lg:w-screen h-screen right-0 lg:items-center lg:h-20 lg:pl-32 overflow-y-scroll pt-16 lg:pt-0 top-0"
      :class="{
        'translate-x-full': !menuVisible,
        'translate-x-0': menuVisible,
        'w-0': !menuVisible,
        'w-screen sm:w-auto': menuVisible,
      }"
    >
      <section
        class="px-6 lg:px-0 divide-y lg:divide-y-0 divide-gray flex flex-1 flex-col lg:flex-row justify-around text-xl 2xs:text-3xl lg:text-sm xl:text-lg lg:space-x-4 text-white"
      >
        <NuxtLink
          class="block hover:text-gray text-right pt-3 2xs:pt-6 lg:text-center lg:py-0"
          v-for="(item, ind) in navItems"
          :class="{ 'border-b-0': ind === (navItems || []).length - 1 }"
          :key="ind"
          :to="item.item ? `/${item.item.slug || ''}` : ''"
          :prefetch="false"
          >{{ item.label }}</NuxtLink
        >
      </section>
      <aside
        class="w-36 mb-32 lg:w-auto ml-auto mr-auto xl:mr-18 lg:justify-self-end lg:ml-2 lg:mb-0 lg:flex"
      >
        <cta
          v-for="(ctaItem, ind) in ctaItems?.content"
          :primary="ind === 0"
          :cta="ctaItem"
          class="block"
        />
      </aside>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { Navigation, Cta as CallToAction } from "~~/server/api/ContentTypes";
interface FetchContent {
  content: Navigation[];
}
interface FetchCta {
  content: CallToAction[];
}
const menuVisible = ref(false);
const scrolling = ref(false);
const { data: nav } = await useFetch<FetchContent>("/api/get/navigation");
const { data: ctaItems } = await useFetch<FetchCta>("/api/get/cta?showOnNavigation=true");
const navItems = nav.value?.content
  .filter((item) => item.type === "Link" || !item.type)
  .sort((a, b) => a.order - b.order);
const logoItems = nav.value?.content
  .filter((item) => item.type === "Logo")
  .sort((a, b) => a.order - b.order);
const toggleMenu = () => (menuVisible.value = !menuVisible.value);
const hideMenu = () => (menuVisible.value = false);
const scrollCheck = () => {
  if (window.scrollY > 0) {
    scrolling.value = true;
    return;
  }
  scrolling.value = false;
};
onMounted(() => window.addEventListener("scroll", scrollCheck));
onBeforeUnmount(() => {
  window.removeEventListener("scroll", scrollCheck);
  menuVisible.value = false;
});
</script>

<style scoped>
a.router-link-active {
  @apply text-gray;
}
</style>
