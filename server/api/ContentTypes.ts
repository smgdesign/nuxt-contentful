// Content Types for all CMS definitions

// Cms default for any content that needs a URL
export type Cms = {
  title?: string;
  description?: string;
  contentType?: string;
  slug?: string;
};

// example Page content type that includes the Cms
export type Page = Cms & {
  body: EmbeddedComponents;
  hero?: Media;
  introduction?: string;
};

// example Navigation content type - supporting 2 types of links
export type Navigation = Cms & {
  label: string;
  order: number;
  item: Cms;
  type: "Link" | "Logo";
  image?: Media;
};

export type Media = {
  url: string;
  contentType: string;
};

export type Cta = Cms & {
  text: string;
  link: string;
};

export type EmbeddedComponents = {
  content: string;
  embeds: {
    [key: string]: ContentBlock | Cta /** add as many others here as you want to embed
    *  | Testimonial
    *  | Profile
    *  | Resource
    *  | Form
    */;
  };
};

export type ContentBlock = {
  title: string;
  showTitle?: boolean;
  body: EmbeddedComponents | string;
  background?: Media;
};
