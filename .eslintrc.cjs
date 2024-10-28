module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es2021: true
    },
    extends: [
        'plugin:vue/vue3-recommended',
        'eslint:recommended',
        '@vue/eslint-config-prettier'
    ],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    rules: {
        // Vue 規則
        'vue/multi-word-component-names': 'off',
        'vue/require-default-prop': 'error',
        'vue/component-definition-name-casing': ['error', 'PascalCase'],
        'vue/component-name-in-template-casing': ['error', 'PascalCase'],
        'vue/component-tags-order': ['error', {
            order: ['script', 'template', 'style']
        }],
        'vue/attributes-order': ['error', {
            order: [
                'DEFINITION',
                'LIST_RENDERING',
                'CONDITIONALS',
                'RENDER_MODIFIERS',
                'GLOBAL',
                ['UNIQUE', 'SLOT'],
                'TWO_WAY_BINDING',
                'OTHER_DIRECTIVES',
                'OTHER_ATTR',
                'EVENTS',
                'CONTENT'
            ]
        }],

        // JavaScript 規則
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-unused-vars': ['warn', {
            vars: 'all',
            args: 'after-used',
            ignoreRestSiblings: true,
            argsIgnorePattern: '^_'
        }],
        'no-undef': 'error',
        'no-var': 'error',
        'prefer-const': 'warn',
        'prefer-template': 'warn',
        'prefer-destructuring': ['warn', {
            array: true,
            object: true
        }],

        // 格式化規則
        'prettier/prettier': ['error', {
            singleQuote: true,
            semi: false,
            trailingComma: 'none',
            printWidth: 100,
            tabWidth: 2,
            endOfLine: 'auto',
            bracketSpacing: true,
            vueIndentScriptAndStyle: true
        }],

        // 最佳實踐
        'curly': ['error', 'multi-line'],
        'eqeqeq': ['error', 'always', { 'null': 'ignore' }],
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-return-await': 'error',
        'require-await': 'warn',
        'no-param-reassign': ['error', {
            props: true,
            ignorePropertyModificationsFor: ['state', 'acc', 'e', 'ctx', 'req', 'res', 'next']
        }],

        // ES6+ 特性
        'arrow-parens': ['error', 'as-needed'],
        'no-duplicate-imports': 'error',
        'no-useless-constructor': 'error',
        'template-curly-spacing': ['error', 'never'],

        // 錯誤預防
        'array-callback-return': 'error',
        'no-await-in-loop': 'warn',
        'no-constant-binary-expression': 'error',
        'no-constructor-return': 'error',
        'no-promise-executor-return': 'error',
        'no-self-compare': 'error',
        'no-template-curly-in-string': 'warn',
        'no-unmodified-loop-condition': 'error',
        'require-atomic-updates': 'error'
    },
    overrides: [
        {
            files: ['**/__tests__/**/*.[jt]s?(x)', '**/*.{test,spec}.[jt]s?(x)'],
            env: {
                jest: true
            },
            rules: {
                'no-unused-expressions': 'off'
            }
        },
        {
            files: ['src/views/**/*.vue'],
            rules: {
                'vue/multi-word-component-names': 'error'
            }
        }
    ],
    globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly'
    }
}