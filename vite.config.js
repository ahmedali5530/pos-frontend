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
  ],
  build: {
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: {
          apollo: ['@apollo/client'],
          lodash: ['lodash'],
          antd: ['antd'],
          nivo: ['@nivo/bar', '@nivo/core', '@nivo/pie'],
          tanstack: ['@tanstack/react-query', '@tanstack/react-query-devtools', '@tanstack/react-table'],
          keyboard: ['react-simple-keyboard'],
          fontawesome: [
            '@fortawesome/fontawesome-svg-core', '@fortawesome/free-regular-svg-icons',
            '@fortawesome/free-solid-svg-icons', '@fortawesome/react-fontawesome'
          ]
        }
      }
    }
  }
})
