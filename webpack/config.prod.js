const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "bundle.min.js",
    path: path.resolve(process.cwd(), "dist"),
  },
  devtool: false,
  performance: {
    maxEntrypointSize: 2500000,
    maxAssetSize: 1200000,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ogg|mp3|wav)$/i,
        type: "asset/resource",
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      "typeof CANVAS_RENDERER": JSON.stringify(true),
      "typeof WEBGL_RENDERER": JSON.stringify(true),
      "typeof WEBGL_DEBUG": JSON.stringify(false),
      "typeof EXPERIMENTAL": JSON.stringify(false),
      "typeof PLUGIN_3D": JSON.stringify(false),
      "typeof PLUGIN_CAMERA3D": JSON.stringify(false),
      "typeof PLUGIN_FBINSTANT": JSON.stringify(false),
      "typeof FEATURE_SOUND": JSON.stringify(true),
    }),
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new CopyPlugin({
      patterns: [
        { from: "public/assets", to: "assets" },
        { from: "public/favicon.png", to: "favicon.png" },
        { from: "public/style.css", to: "style.css" },
      ],
    }),
  ],
};
