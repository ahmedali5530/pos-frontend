import {defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react";
import {resolve} from 'path'
import envCompatible from 'vite-plugin-env-compatible';
import svgr from 'vite-plugin-svgr'

process.env = {...process.env, ...loadEnv('dev', process.cwd())};

export default defineConfig({
  server: {
    port: 3000
  },
  resolve: {
    alias: [
      {
        find: "common",
        replacement: resolve(__dirname, "src/common"),
      },
    ],
  },
  plugins: [
    react(),
    svgr(),
    envCompatible
  ]
})