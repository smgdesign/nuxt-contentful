<template>
  <div class="embedded">
    <component :is="embeddedContent"></component>
  </div>
</template>
<script lang="ts" setup>
import {
  EmbeddedComponents,
} from "~~/server/api/ContentTypes";
const props = defineProps<{
  html: EmbeddedComponents | String;
}>();

const cfAsset = resolveComponent("CfAsset");
const contentBlock = resolveComponent("ContentBlock");

const parsed = () => {
  if (typeof props.html === "string") {
    return props.html;
  }
  const htmlObj = props.html as EmbeddedComponents;
  const cfAssetReg = new RegExp(
    `<cf-asset id="([^"]*?)" source="([^"]*?)" type="([^"]*?)" description="([^"]*?)" usage="([^"]*?)" />`,
    "g"
  );

  const contentBlockReg = new RegExp(`<content-block id="([^"]*?)" />`, "g");
  let icb = 0;

  // finding items
  let parsedStr = htmlObj.content
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
    .replaceAll(contentBlockReg, ($0, $1: string) => {
      ++icb;
      return `<content-block id="${$1}" :ind="${icb}" :nested="false"><data>${encodeURIComponent(
        JSON.stringify(htmlObj.embeds[$1])
      )}</data></content-block>`;
    });
  return parsedStr;
};
const embeddedContent = computed(() => {
  return {
    components: {
      cfAsset,
      contentBlock,
    },
    template: parsed(),
  };
});
</script>
<style>
.embedded > p.center {
  @apply mx-auto w-2/3 my-28 lg:text-lg;
}
.embedded > p {
  @apply mx-8 my-2;
}
.embedded > h2 {
  @apply mx-8 text-4xl mt-8 mb-5 leading-tight;
}
.embedded > h3 {
  @apply mx-8 text-3xl mt-6 mb-4 leading-tight;
}
.embedded > h4 {
  @apply mx-8 text-2xl mt-5 mb-3 leading-tight;
}
.embedded > h5 {
  @apply mx-8 text-xl mt-4 mb-2 leading-tight;
}
.embedded > h6 {
  @apply mx-8 text-lg mt-2 mb-1 leading-tight;
}
.embedded > blockquote {
  @apply mx-8 my-8 px-2 border-l-2 border-white;
}
.embedded > blockquote p:first-child {
  @apply pb-1 text-lg;
}
.embedded a:link {
  @apply underline hover:no-underline;
}
.embedded > ul, .embedded > ul ul, .embedded > ol ul {
  @apply mx-2 mt-3 mb-2 list-disc list-outside;
}
.embedded > ol, .embedded > ul ol, .embedded > ol ol {
  @apply list-decimal list-outside;
}
.embedded > ul li, .embedded > ol li {
  @apply px-2 pt-2 pb-3 mx-8;
}
.embedded > table {
  @apply mx-8 lg:mx-auto my-3 max-w-full lg:w-2/3 text-left border table-fixed;
}
.embedded > table thead th, .embedded > table th {
  @apply border border-collapse bg-gray-darker px-6 py-4 max-w-[50vw];
}
.embedded > table tr {
  @apply hover:bg-gray-darker;
}
.embedded > table td {
  @apply border border-collapse font-light px-6 py-4 max-w-[50vw];
}
</style>
