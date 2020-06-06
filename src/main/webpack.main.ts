import type { Configuration } from 'webpack';
import path = require('path');

module.exports = (env): Configuration => {
  if (!env) {
    env = 'development';
  }
  return {
    entry: {
      main: './src/main/src/main.ts',
    },
    target: 'electron-main',
    output: {
      path: path.resolve(__dirname, '../../dist/main'),
      filename: 'electron-main.js',
    },
    externals: [],
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.ts?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.ts', 'json'],
    },
    node: {
      __dirname: true,
      __filename: true,
    },
    plugins: [],
  };
};
