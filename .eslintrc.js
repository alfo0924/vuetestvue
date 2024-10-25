module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es2021: true
    },
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/prettier'
    ],
    parserOptions: {
        parser: '@babel/eslint-parser',
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    rules: {
        // 基本規則
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-unused-vars': ['warn', {
            vars: 'all',
            args: 'after-used',
            ignoreRestSiblings: true
        }],
        'no-undef': 'error',
        'no-var': 'error',
        'prefer-const': 'warn',

        // Vue 相關規則
        'vue/multi-word-component-names': 'off',
        'vue/no-unused-components': 'warn',
        'vue/no-unused-vars': 'warn',
        'vue/require-default-prop': 'warn',
        'vue/require-prop-types': 'warn',
        'vue/order-in-components': ['error', {
            order: [
                'el',
                'name',
                'key',
                'parent',
                'functional',
                ['delimiters', 'comments'],
                ['components', 'directives', 'filters'],
                'extends',
                'mixins',
                ['provide', 'inject'],
                'ROUTER_GUARDS',
                'layout',
                'middleware',
                'validate',
                'scrollToTop',
                'transition',
                'loading',
                'inheritAttrs',
                'model',
                ['props', 'propsData'],
                'emits',
                'setup',
                'asyncData',
                'data',
                'fetch',
                'head',
                'computed',
                'watch',
                'watchQuery',
                'LIFECYCLE_HOOKS',
                'methods',
                ['template', 'render'],
                'renderError'
            ]
        }],

        // 程式碼風格
        'prettier/prettier': ['error', {
            singleQuote: true,
            semi: false,
            trailingComma: 'none',
            printWidth: 100,
            tabWidth: 2,
            endOfLine: 'auto'
        }],
        'arrow-body-style': ['error', 'as-needed'],
        'prefer-arrow-callback': 'warn',
        'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
        'no-trailing-spaces': 'error',
        'eol-last': 'error',

        // ES6+ 特性
        'arrow-parens': ['error', 'as-needed'],
        'no-duplicate-imports': 'error',
        'no-useless-constructor': 'error',
        'prefer-template': 'warn',
        'template-curly-spacing': ['error', 'never'],
        'prefer-destructuring': ['warn', {
            array: true,
            object: true
        }],

        // 最佳實踐
        'curly': ['error', 'multi-line'],
        'eqeqeq': ['error', 'always'],
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-return-await': 'error',
        'require-await': 'warn',
        'no-param-reassign': ['error', { props: false }],
        'no-use-before-define': ['error', { functions: false }],

        // 錯誤預防
        'no-array-constructor': 'error',
        'no-caller': 'error',
        'no-extend-native': 'error',
        'no-extra-bind': 'error',
        'no-extra-label': 'error',
        'no-floating-decimal': 'error',
        'no-implicit-globals': 'error',
        'no-implied-eval': 'error',
        'no-iterator': 'error',
        'no-labels': 'error',
        'no-lone-blocks': 'error',
        'no-multi-spaces': 'error',
        'no-multi-str': 'error',
        'no-new': 'error',
        'no-new-func': 'error',
        'no-new-wrappers': 'error',
        'no-octal-escape': 'error',
        'no-proto': 'error',
        'no-return-assign': 'error',
        'no-script-url': 'error',
        'no-self-compare': 'error',
        'no-sequences': 'error',
        'no-throw-literal': 'error',
        'no-unmodified-loop-condition': 'error',
        'no-useless-call': 'error',
        'no-useless-concat': 'error',
        'no-void': 'error',
        'no-with': 'error',
        'radix': 'error',
        'wrap-iife': ['error', 'any']
    },
    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)'
            ],
            env: {
                jest: true
            }
        }
    ]
}