/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/vue" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "virtual:generated-pages" {
  import type { RouteRecordRaw } from "vue-router";
  const routes: RouteRecordRaw[];
  //@ts-ignore
  export default routes;
}

interface ImportMetaEnv {
  readonly VITE_STRAPI_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "rss-parser/dist/rss-parser.js";
