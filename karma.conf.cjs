module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'webpack'],

    files: [
      { pattern: 'src/tests/**/*.spec.js', watched: false },
      { pattern: 'src/tests/**/*.spec.jsx', watched: false },
    ],
    preprocessors: {
      'src/tests/**/*.spec.*': ['webpack'],
    },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.js', '.jsx'] },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: 'last 2 Chrome versions' }],
                  ['@babel/preset-react', { runtime: 'automatic' }],
                ],
                plugins: [['istanbul', { include: ['src/**'], exclude: ['src/tests/**', 'src/main.jsx'] }]],
              },
            },
          },
          { test: /\.(png|jpe?g|gif|svg|webp)$/i, type: 'asset/inline' },
        ],
      },
      stats: 'errors-only',
    },

    client: {
      jasmine: { random: false },
      clearContext: false,
    },

    reporters: ['spec', 'kjhtml', 'coverage'],
    specReporter: { suppressSkipped: true, showSpecTiming: true },

    coverageReporter: {
      dir: 'coverage',
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text' },
        { type: 'text-summary' },
        { type: 'json-summary' },
      ],
    },

    browsers: ['ChromeHeadlessSinSandbox'],
    customLaunchers: {
      ChromeHeadlessSinSandbox: { base: 'ChromeHeadless', flags: ['--no-sandbox'] },
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    singleRun: false,
    browserNoActivityTimeout: 60000,
  })
}
