const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    ui: './src/app/index.tsx',
    code: './src/plugin/code.ts',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpg|gif|webp|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 8192, // Images under 8KB will be inlined as base64 URLs
          name: 'assets/images/[name].[hash].[ext]', // Images will be saved to dist/assets/images/
        },
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      chunks: ['ui'],
      cache: false,
      inject: 'body',
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/ui/]),
    
    // Copy image assets from the public folder to the dist folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public/assets/images'),
          to: path.resolve(__dirname, 'dist/assets/images'),
        },
      ],
    }),
  ],
});
