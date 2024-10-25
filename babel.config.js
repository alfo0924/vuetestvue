module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    [
      'component',
      {
        'libraryName': 'element-ui',
        'styleLibraryName': 'theme-chalk'
      }
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        'corejs': 3,
        'helpers': true,
        'regenerator': true,
        'useESModules': false
      }
    ]
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            }
          }
        ]
      ],
      plugins: ['@babel/plugin-transform-modules-commonjs']
    },
    production: {
      plugins: [
        'transform-remove-console',
        'transform-remove-debugger'
      ]
    }
  }
}