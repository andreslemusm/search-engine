/// <reference types="@remix-run/dev" />

declare namespace NodeJS {
  export interface ProcessEnv {
    readonly ES_NODE: string;
    readonly ES_USER: string;
    readonly ES_PASSWORD: string;
  }
}

/// <reference types="@vercel/remix" />
