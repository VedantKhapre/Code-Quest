/// <reference path="../.astro/types.d.ts" />
interface ImportMetaEnv {
  readonly PUBLIC_MISTRAL_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}