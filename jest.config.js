module.exports = {
  // 測試環境
  testEnvironment: 'jsdom',

  // 模組文件擴展名
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue'
  ],

  // 模組名稱映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^~/(.*)$': '<rootDir>/src/$1',
    '^vue$': 'vue/dist/vue.common.js',
    // 處理靜態資源
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/test/unit/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/test/unit/__mocks__/styleMock.js'
  },

  // 轉換器設定
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
    '.+\\.(css|scss|png|jpg|svg)$': 'jest-transform-stub'
  },

  // 轉換器忽略路徑
  transformIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // 測試覆蓋率收集設定
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!src/router/index.js',
    '!**/node_modules/**'
  ],
  coverageReporters: ['text', 'lcov', 'clover'],
  coverageDirectory: '<rootDir>/test/unit/coverage',

  // 測試配置
  testMatch: [
    '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // 快照序列化
  snapshotSerializers: [
    'jest-serializer-vue'
  ],

  // 設置測試環境
  setupFiles: ['<rootDir>/test/unit/setup.js'],
  setupFilesAfterEnv: ['<rootDir>/test/unit/setupTests.js'],

  // 全域變數設定
  globals: {
    'vue-jest': {
      experimentalCSSCompile: true
    }
  },

  // 測試超時設定
  testTimeout: 10000,

  // 自定義報告器
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test/unit/reports',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ]
  ],

  // 測試環境變數
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },

  // 模擬函數設定
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,

  // 快取設定
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',

  // 並行執行設定
  maxConcurrency: 5,
  maxWorkers: '50%',

  // 錯誤處理
  bail: false,
  verbose: true,

  // 自定義解析器
  resolver: '<rootDir>/test/unit/resolver.js'
}