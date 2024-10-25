import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import eslintPlugin from 'vite-plugin-eslint'
import vueInspector from 'vite-plugin-vue-inspector'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import viteImagemin from 'vite-plugin-imagemin'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'

  return {
    base: env.VITE_BASE_URL || '/',

    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: tag => tag.startsWith('ion-')
          }
        }
      }),
      eslintPlugin({
        include: ['src/**/*.{js,vue}'],
        exclude: ['node_modules/**', 'dist/**'],
        cache: false
      }),
      vueInspector(),
      VitePWA({
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
          ],
          start_url: '/',
          display: 'standalone',
          orientation: 'portrait'
        },
        workbox: {
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.citizencard\.com/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24
                }
              }
            }
          ]
        }
      }),
      isProduction && visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true
      }),
      isProduction && viteCompression({
        verbose: true,
        algorithm: 'gzip',
        ext: '.gz'
      }),
      isProduction && viteImagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false
        },
        optipng: {
          optimizationLevel: 7
        },
        mozjpeg: {
          quality: 80
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox'
            },
            {
              name: 'removeEmptyAttrs',
              active: false
            }
          ]
        }
      })
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
        '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
        '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
        '@constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
        '@services': fileURLToPath(new URL('./src/services', import.meta.url))
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },

    server: {
      host: true,
      port: 8080,
      strictPort: true,
      https: false,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
          secure: false,
          ws: true,
          timeout: 30000
        },
        '/upload': {
          target: env.VITE_UPLOAD_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/upload/, ''),
          secure: false
        },
        '/ws': {
          target: env.VITE_WS_URL,
          ws: true,
          changeOrigin: true
        }
      },
      watch: {
        usePolling: true
      }
    },

    build: {
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          chunkFileNames: isProduction ? 'js/[name].[hash].js' : 'js/[name].js',
          entryFileNames: isProduction ? 'js/[name].[hash].js' : 'js/[name].js',
          assetFileNames: isProduction ? 'assets/[name].[hash].[ext]' : 'assets/[name].[ext]',
          manualChunks: {
            'core-vendor': ['vue', 'vue-router', 'pinia'],
            'auth': ['jwt-decode', 'vee-validate', 'yup'],
            'utils': ['axios', 'dayjs', 'lodash-es'],
            'ui': ['bootstrap', 'bootstrap-icons', 'sweetalert2'],
            'features': {
              include: [
                /src\/store\/modules\/.+/,
                /src\/views\/(members|movies|bookings|benefits|venues|wallet)/
              ]
            },
            'common': {
              include: [
                /src\/components\/common\/.+/,
                /src\/utils\/.+/,
                /src\/hooks\/.+/
              ]
            }
          }
        }
      }
    },

    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/assets/styles/variables.scss";
            @import "@/assets/styles/mixins.scss";
          `
        }
      },
      modules: {
        localsConvention: 'camelCaseOnly'
      }
    },

    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        'dayjs',
        'jwt-decode',
        'bootstrap',
        'bootstrap-icons',
        'sweetalert2',
        'vee-validate',
        'yup',
        'lodash-es'
      ],
      exclude: ['vue-demi']
    },

    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: ['./test/setup.js'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'dist/',
          'src/assets/',
          'src/locales/',
          'test/',
          '**/*.d.ts',
          '**/*.spec.{js,ts}',
          '**/*.test.{js,ts}'
        ]
      }
    },

    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: !isProduction,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: !isProduction,
      'process.env': env
    }
  }
})