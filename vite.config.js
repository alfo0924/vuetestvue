import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 載入環境變數
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // 基本配置
    base: env.VITE_BASE_URL || '/',

    // 插件配置
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: tag => tag.startsWith('ion-')
          }
        }
      })
    ],

    // 解析配置
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': path.resolve(__dirname, 'src'),
        'assets': path.resolve(__dirname, 'src/assets'),
        'components': path.resolve(__dirname, 'src/components'),
        'views': path.resolve(__dirname, 'src/views'),
        'utils': path.resolve(__dirname, 'src/utils')
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.vue']
    },

    // 服務器配置
    server: {
      host: '0.0.0.0',
      port: 8080,
      strictPort: true,
      https: false,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        },
        '/upload': {
          target: env.VITE_UPLOAD_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/upload/, '')
        }
      }
    },

    // 建置配置
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'vuex', 'axios'],
            'element-plus': ['element-plus']
          }
        }
      }
    },

    // CSS 配置
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/assets/styles/variables.scss";
            @import "@/assets/styles/mixins.scss";
          `
        }
      }
    },

    // 優化配置
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'vuex',
        'axios',
        'dayjs',
        'lodash-es'
      ]
    },

    // PWA 配置
    pwa: {
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: '市民卡系統',
        short_name: '市民卡',
        description: '便捷的市民服務平台',
        theme_color: '#0d6efd',
        background_color: '#ffffff',
        icons: [
          {
            src: 'img/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'img/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },

    // 環境變數配置
    define: {
      'process.env': env
    }
  }
})