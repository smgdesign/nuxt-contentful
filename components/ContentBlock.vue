<template>
  <div class="relative">
    <div
      v-if="title && !nested"
      :class="{
        'items-center mx-8 md:mx-16 2xl:mx-32 flex space-x-8': !nested,
      }"
    >
      <h2 class="text-white font-light text-2xl xl:text-3xl">{{ title }}</h2>
      <div class="bg-gray h-px flex-1"></div>
    </div>
    <component :is="!nested ? 'article' : 'div'"
      class="text-white"
      :class="{
        root: !nested,
        nested: nested,
        relative: json.background,
      }"
    >
      <nuxt-img
        provider="contentful"
        v-if="
          json.background &&
          json.background.contentType.startsWith('image/')
        "
        class="absolute z-0 object-cover w-screen h-full"
        :src="json.background.url"
        sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw"
      />
      <video
        v-else-if="
          json.background &&
          json.background.contentType.startsWith('video/')
        "
        class="absolute z-0 object-cover w-screen h-full object-right-bottom"
        autoplay
        loop
        muted
        playsinline
      >
        <source :src="json.background.url" />
      </video>
      <div
        class="relative"
        :class="{
          'overflow-auto': json.background,
          'items-center mx-8 md:mx-16 2xl:mx-32': !nested,
          'mt-8 md:mt-16 2xl:mt-32': !nested && !json.background,
          'flex flex-wrap justify-between':
            (!nested && typeof json.body !== 'string'),
          'li-full pl-8 h-screen max-h-256 md:w-2/3':
            !nested,
        }"
      >
        <h1
          v-if="json.title && json.showTitle"
          class="mt-8 text-3xl md:text-4xl xl:text-6xl leading-tight xl:leading-snug"
          v-html="json.title"
        />
        <div
          v-if="json.title && json.showTitle"
          class="bg-primary mt-4 mb-8 w-32 md:w-56 xl:w-1/3 h-0.5 md:h-1"
        ></div>
        <component :is="contentBlock"></component>
        <cf-asset
          v-if="json.background"
          :source="json.background.url"
          :type="json.background.contentType"
          class="w-full md:w-1/3"
        />
      </div>
    </component>
    <div
      v-if="nested && ind === 1"
      class="rotate-25 transition-all duration-300 absolute border-8 w-36 h-36 2xl:w-52 2xl:h-52 right-16 top-16 2xl:top-20 z-0 border-gray/10"
    ></div>
  </div>
</template>
<script lang="ts" setup>
import {
  ContentBlock,
  EmbeddedComponents,
  Cta,
} from "~~/server/api/ContentTypes";
const props = withDefaults(
  defineProps<{
    nested?: boolean;
    ind?: number;
  }>(),
  {
    nested: false,
    ind: 0,
  }
);
const slots = useSlots();
const json: ContentBlock = slots.default
  ? JSON.parse(decodeURIComponent(`${slots.default()[0].children}`))
  : null;
const title = json.title;
const cta = resolveComponent("Cta");
const cfAsset = resolveComponent("CfAsset");
const contentBlockNested = resolveComponent("ContentBlock");
const parsed = () => {
  if (typeof json.body === "string") {
    return json.body;
  }
  const jsonBody = json.body as EmbeddedComponents;
  const cfAssetReg = new RegExp(
    `<cf-asset id="([^"]*?)" source="([^"]*?)" content-type="([^"]*?)" description="([^"]*?)" usage="([^"]*?)" />`,
    "g"
  );
  const ctaReg = new RegExp(`<call-to-action id="([^"]*?)" />`, "g");
  const contentBlockReg = new RegExp(`<content-block id="([^"]*?)" />`, "g");
  let icb = 0;

  const stickyScrollerReg = new RegExp(
    `<sticky-scroller id="([^"]*?)" />`,
    "g"
  );
  let iss = 0;

  let parsedStr = jsonBody.content
    .replaceAll(
      cfAssetReg,
      (
        $0,
        id: string,
        source: string,
        contentType: string,
        desc: string,
      ) => {
        return `<cf-asset id="${id}" source="${source}" type="${contentType}" description="${desc}"></cf-asset>`;
      }
    )
    .replaceAll(ctaReg, ($0, id: string) => {
      const cta = jsonBody.embeds[id] as Cta;
      return `<cta id="${id}" text="${cta.text}" link="${cta.link}"></cta>`;
    })
    .replaceAll(contentBlockReg, ($0, id: string) => {
      ++icb;
      return `<content-block id="${id}" :ind="${icb}" :nested="true"><data>${encodeURIComponent(
        JSON.stringify(jsonBody.embeds[id])
      )}</data></content-block>`;
    })
    .replaceAll(stickyScrollerReg, ($0, id: string) => {
      ++iss;
      return `<sticky-scroller :ind="${iss}"><data>${encodeURIComponent(
        JSON.stringify(jsonBody.embeds[id])
      )}</data></sticky-scroller>`;
    });
  return parsedStr;
};
const contentBlock = computed(() => {
  return {
    components: {
      cfAsset,
      cta,
      contentBlock: contentBlockNested,
    },
    template: parsed(),
  };
});
</script>
<style>
.nested > div > ul {
  @apply text-white font-light text-2xl divide-y divide-gray mx-auto max-w-xs;
}
.nested > div > ul > li {
  @apply text-center mb-2 pt-2;
}
.root > div > ul {
  @apply w-1/2 mx-auto my-20 text-white font-light text-2xl space-y-8;
}
.root > div.li-full {
  @apply pt-24;
}
.root > div.li-full > ul {
  @apply w-full text-sm lg:text-lg leading-relaxed;
}
.root > div > ul > li {
  @apply border-primary border-l-4 pl-2 text-left;
}
article.root > div > h2, div.nested > div > h2 {
  @apply mb-8 text-5xl leading-tight;
}
article.root > div > h3, div.nested > div > h3 {
  @apply mb-8 text-4xl leading-tight;
}
article.root > div p, div.nested > div p {
  @apply mb-4 text-sm md:text-lg leading-relaxed font-light;
}
article.root > div .aside, div.nested > div .aside {
  @apply py-6;
}
article.root > div > hr, div.nested > div > hr {
  @apply text-gray my-12;
}
</style>
