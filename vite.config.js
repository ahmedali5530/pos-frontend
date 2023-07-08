import {defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react";
import {resolve} from 'path'
import envCompatible from 'vite-plugin-env-compatible';


process.env = {...process.env, ...loadEnv('dev', process.cwd())};

export default defineConfig({
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
    envCompatible
  ],
})
