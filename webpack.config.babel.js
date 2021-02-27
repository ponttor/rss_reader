import HtmlWebpackPlugin from 'html-webpack-plugin';

module.exports = {
  mode: process.env.NODE_ENV || 'development',
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
        test: /\.(scss)$/,
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
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  entry: './src/index.js',

  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
  ],
};
