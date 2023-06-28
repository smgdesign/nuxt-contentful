// the main bulk of our rendering and handling Contentful responses
// supports:
// * inline HTML with formatting
// * automatic <p> tag removal of single line rich text
// * custom component markup for embedded elements (supports Entry and Inline Entry)
// * custom asset support for embedding Assets
// * nested content and dynamic list support
// * anything in the editor with <center></center> around it gets styled with inline css to support centre text
// tweak this code for your needs, it is a base boilerplate
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import {
  documentToHtmlString,
  Options,
} from "@contentful/rich-text-html-renderer";
const componentName = (str: string) => {
  return str
    .split("")
    .map((letter, idx) => {
      return letter.toUpperCase() === letter
        ? `${idx !== 0 ? "-" : ""}${letter.toLowerCase()}`
        : letter;
    })
    .join("");
};
export const ParseField = (field: any) => {
  if (!field) {
    return field;
  }
  if (String(field) === field || !isNaN(field)) {
    return field;
  }
  if (field.nodeType === "document") {
    const embedContent = (node: any, children: any) => {
      if (node.data.target.sys && node.data.target.sys.contentType) {
        const parsedFields: {
          [key: string]: any;
        } = {};
        for (const fieldName in node.data.target.fields) {
          if (node.data.target.fields[fieldName]) {
            parsedFields[fieldName] = ParseField(
              node.data.target.fields[fieldName]
            );
          }
        }
        if (!embeds[node.data.target.sys.id]) {
          embeds[node.data.target.sys.id] = parsedFields;
        }

        return `<${componentName(
          node.data.target.sys.contentType.sys.id
        )} id="${node.data.target.sys.id}" />`;
      }
      return "";
    };
    const embedContentInline = (node: any, children: any) => {
      if (node.data.target.sys && node.data.target.sys.contentType) {
        const parsedFields: {
          [key: string]: any;
        } = {};
        for (const fieldName in node.data.target.fields) {
          if (node.data.target.fields[fieldName]) {
            parsedFields[fieldName] = ParseField(
              node.data.target.fields[fieldName]
            );
          }
        }
        if (!embeds[node.data.target.sys.id]) {
          embeds[node.data.target.sys.id] = parsedFields;
        }

        return `<${componentName(
          node.data.target.sys.contentType.sys.id
        )} id="${node.data.target.sys.id}" />`;
      }
      return "";
    };
    const embedAssetInline = (node: any, children: any) => {
      if (node.data.target.sys && node.data.target.sys.type === "Asset") {
        assets[node.data.target.sys.id] = node.data.target.fields;
        return `<cf-asset id="${node.data.target.sys.id}" source="${node.data.target.fields.file.url}" type="${node.data.target.fields.file.contentType}" description="${node.data.target.fields.title}" usage="${node.data.target.fields.description}" />`;
      }
      return "";
    };
    const embeds: {
      [key: string]: any;
    } = {};
    const assets: {
      [key: string]: any;
    } = {};
    const options: Partial<Options> = {
      renderNode: {
        [INLINES.EMBEDDED_ENTRY]: embedContentInline,
        [BLOCKS.EMBEDDED_ASSET]: embedAssetInline,
        [BLOCKS.EMBEDDED_ENTRY]: embedContent,
        [BLOCKS.LIST_ITEM]: (node, next) =>
          `<li>${next(node.content).replace(/<p>|<\/p>/g, "")}</li>`,
      },
    };
    if (options.renderNode) {
      if (field.content.length === 1) {
        options["renderNode"][BLOCKS.PARAGRAPH] = (node, next) =>
          next(node.content);
      } else {
        options["renderNode"][BLOCKS.PARAGRAPH] = (node, next) => {
          const centerSearch = new RegExp(
            `&lt;center&gt;(.*?)&lt;\/center&gt;`,
            "g"
          );
          let isCenter = false;
          const content = next(node.content).replaceAll(
            centerSearch,
            ($0: string, $1: string) => {
              isCenter = true;
              return `<p style="text-align: center;" class="center">${$1}</p>`;
            }
          );
          return content === "" ? "" : isCenter ? content : `<p>${content}</p>`;
        };
      }
    }
    const content = documentToHtmlString(field, options);
    if (Object.keys(embeds).length > 0) {
      return {
        content,
        embeds,
        assets,
      };
    } else {
      return content;
    }
  }
  if (field.fields?.file) {
    return field.fields?.file;
  }
  if (field.fields) {
    const parsedFields: {
      [key: string]: any;
    } = {};
    for (const fieldName in field.fields) {
      if (field.fields[fieldName]) {
        parsedFields[fieldName] = ParseField(field.fields[fieldName]);
      }
    }
    return parsedFields;
  }
  if (field.length) {
    return field.map((nestedContent: any) => {
      if (String(nestedContent) === nestedContent || !isNaN(nestedContent)) {
        return nestedContent;
      }
      const parsedFields: {
        [key: string]: any;
      } = {};
      for (const nestedField in nestedContent.fields) {
        parsedFields[nestedField] = ParseField(
          nestedContent.fields[nestedField]
        );
      }
      return parsedFields;
    });
  }
};
