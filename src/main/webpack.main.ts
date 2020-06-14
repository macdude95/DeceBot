import * as webpack from 'webpack';
import * as path from 'path';

export default (env): webpack.Configuration => {
  if (!env) {
    env = 'development';
  }
  return {
    entry: {
      main: './src/main/src/main.ts',
    },
    target: 'electron-main',
    mode: env,
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
      __dirname: false,
      __filename: false,
    },
    plugins: [],
  };
};
