import {defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react";
import {resolve} from 'path'
import envCompatible from 'vite-plugin-env-compatible';
import svgr from 'vite-plugin-svgr'
import path from "path"

process.env = {...process.env, ...loadEnv('dev', process.cwd())};

export default defineConfig({
  server: {
    port: 3000
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  },
  plugins: [
    react(),
    svgr(),
    envCompatible()
  ],
  build: {
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('lodash')) {
            return 'lodash';
          }
          if (id.includes('antd')) {
            return 'antd';
          }
          if (id.includes('@nivo')) {
            return 'nivo';
          }
          if (id.includes('@tanstack')) {
            return 'tanstack';
          }
          if (id.includes('react-simple-keyboard')) {
            return 'keyboard';
          }
          if (id.includes('@fortawesome')) {
            return 'fontawesome';
          }
        }
      }
    }
  }
})
