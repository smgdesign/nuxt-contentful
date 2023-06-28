import contentful, {
  AssetCollection,
  ContentfulClientApi,
  CreateClientParams,
  EntryCollection,
} from "contentful";
import { QueryValue } from "ufo";
import { Cache } from "../Cache";
import {
  Cms,
  Cta,
} from "../ContentTypes";
import { ParseField } from "../ParseField";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const config: CreateClientParams = {
    space: runtimeConfig.CTF_SPACE_ID || "",
    accessToken: runtimeConfig.CTF_CDA_ACCESS_TOKEN || "",
  };
  const client = contentful.createClient(config);
  // content_type is the named path parameter for the URL in the API
  const contentType: string = event?.context?.params?.content_type || "";
  // add any additional query string parameters here - eg showOnNavigation
  // const { slug, showOnNavigation } = getQuery(event);
  const { slug } = getQuery(event);
  let response: EntryCollection<Cms[]> | undefined = undefined;
  let assets: AssetCollection | undefined = undefined;
  let children: EntryCollection<Cms[]> | undefined = undefined;
  let all: EntryCollection<Cms[]> | undefined = undefined;
  const cache = new Cache();
  // cache set in seconds
  cache.SetTTL(120);
  // an example content type to retrieve a single item by slug or a list of items
  // in this instance the content_type in Contentful is `page`
  /**
   * contentType is the path added to the API call - /api/content or /api/cta (/api/:contentType)
   if (contentType === "content") {
    if (slug) {
      response = await client.getEntries<Content[]>({
        content_type: "page",
        include: 3,
        [`fields.slug`]: slug,
      });
    } else {
      response = await client.getEntries<Content[]>({
        content_type: "page",
      });
    }
  }
  */
  // an example content type to retrieve product categories
  // including products nested under their associated category
  // and product items selected by slug or a list of all products
  /**
   if (contentType === "productCategory") {
    if (slug) {
      response = await client.getEntries<ProductCategory[]>({
        content_type: "productCategory",
        [`fields.slug`]: slug,
        include: 10,
      });
      if (response.items.length > 0) {
        children = (await client.getEntries<ProductItem[]>({
          content_type: "productItem",
          [`fields.productCategory.sys.contentType.sys.id`]:
            response.items[0].sys.contentType.sys.id,
          [`fields.productCategory.fields.slug`]: slug,
          include: 10,
        })) as EntryCollection<ProductItem[]>;
      }
    } else {
      response = await client.getEntries<ProductCategory[]>({
        content_type: contentType,
      });
    }
  } else if (contentType === "productItem") {
    if (slug) {
      response = await client.getEntries<ProductItem[]>({
        content_type: contentType,
        [`fields.slug`]: slug,
        include: 10,
      });
    } else {
      response = await client.getEntries<ProductItem[]>({
        content_type: contentType,
      });
    }
  }
  */
  // an example content type to retrieve blog posts
  // including related posts
  /**
  if (contentType === "blogPost") {
    if (slug) {
      const tmpPosts = await client.getEntries<BlogPost[]>({
        content_type: contentType,
        [`fields.slug`]: slug,
        include: 1,
      });
      // remove relatedPosts from the result to avoid infinite recursion
      delete (tmpPosts.items[0].fields as unknown as BlogPost).relatedPosts;
      response = tmpPosts;
      // now retrieve all child posts by selecting all
      // blogPost that contains a link to our response id
      // Contentful API reference here:
      // https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters/links-to-entry
      // it is sometimes more appropriate to use search_on_reference
      // Contentful API reference here:
      // https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters/search-on-references
      children = (await client.getEntries<BlogPost[]>({
        content_type: contentType,
        links_to_entry: response.items[0].sys.id,
        select: "fields.slug,fields.title",
        include: 0,
      })) as EntryCollection<BlogPost[]>;
      // and this retrieves the latest 6 blog posts
      // add sorting as you wish
      // Contentful API reference here:
      // https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters/order
      all = (await client.getEntries<BlogPost[]>({
        content_type: contentType,
        limit: 6,
        select: "fields.slug,fields.title",
        include: 0,
      })) as EntryCollection<BlogPost[]>;
    } else {
      response = await client.getEntries<BlogPost[]>({
        content_type: contentType,
      });
    }
  }
  // this is your page not found response, useful when any of the above don't catch a content type or find an item
  if (!response) {
    response = await client.getEntries<Content[]>({
      id: "{{your_not_found_id_here}}",
    });
  }
  */
  return processResponse(client, response, slug, children, all);
});

/**
 * 
 * @param client ContentfulClientApi - the Contentful API for any further querying
 * @param response EntryCollection<Cms[]> | undefined - the response object from finding a content item
 * @param slug QueryValue | QueryValue[] - slug value sent from the API query string
 * @param children EntryCollection<Cms[]> | undefined - optional list of children related to the content type
 * @param all EntryCollection<Cms[]> | undefined - optional list to be populated of any other listed content
 * @returns 
 */
const processResponse = (
  client: ContentfulClientApi,
  response: EntryCollection<Cms[]> | undefined,
  slug: QueryValue | QueryValue[] = undefined,
  children: EntryCollection<Cms[]> | undefined = undefined,
  all: EntryCollection<Cms[]> | undefined = undefined
) => {
  // return an empty HTTP response if no response found
  if (response === undefined) return;
  // set up our parsedFields object
  let parsedFields: {
    all?: any;
    children?: any;
    [key: string]: any;
  } = {};
  // if no matching response found return an empty object
  // this is essentially a 404
  if (response.items.length === 0) return parsedFields;
  // if a slug was specified
  // process just the first item
  // equivalent of findById
  if (slug) {
    const item = response.items[0];
    for (const field in item.fields) {
      parsedFields[field] = ParseField(item.fields[field]);
    }
    if (children) {
      parsedFields[`children`] = processResponse(client, children);
    }
    if (all) {
      parsedFields[`all`] = processResponse(client, all);
    }
  // otherwise iterate all found items
  } else {
    parsedFields = response.items.map((item) => {
      const parsedFields: {
        [key: string]: any;
      } = {};
      for (const field in item.fields) {
        parsedFields[field] = ParseField(item.fields[field]);
      }
      return parsedFields;
    });
  }
  return {
    content: parsedFields,
  };
};
