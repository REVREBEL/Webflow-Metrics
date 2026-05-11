import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  output: "server",

  adapter: cloudflare({
    mode: "directory",
  }),

  integrations: [
    react(),
    tailwind(),
  ],

  vite: {
    build: {
 	cssMinify: "esbuild",
    },
    ssr: {
      external: [
        "@google-cloud/bigquery",
        "@google-cloud/common",
        "@google-cloud/paginator",
        "@google-cloud/projectify",
        "google-auth-library",
        "gaxios",
        "teeny-request",
        "retry-request",
        "node-fetch",
        "jws",
        "jwa",
        "util",
        "stream",
        "crypto",
        "fs",
        "path",
        "os",
        "http",
        "https",
        "child_process",
        "querystring",
        "net",
        "tls",
        "url",
        "assert"
      ]
    }
  }
});