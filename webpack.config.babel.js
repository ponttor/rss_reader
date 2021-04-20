import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  output: {
    path: path.resolve(__dirname, 'dist/'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(scss|css)$/,
        use: [{
          // inject CSS to page
          loader: 'style-loader',
        }, {
          // translates CSS into CommonJS modules
          loader: 'css-loader',
        }, {
          // compiles Sass to CSS
          loader: 'sass-loader',
        }],
      },
    ],
  },

  entry: './src/index.js',

  plugins: [
    new HtmlWebpackPlugin({
      title: 'RSS Reader',
      template: 'index.html',
    }),
  ],
};
