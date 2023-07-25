const path = require("path");
require("dotenv").config();
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  entry: path.resolve(__dirname, "..", "./src/index.tsx"),
  output: {
    path: path.resolve(__dirname, "..", "./dist"),
    filename: "[name].bundle.js",
    publicPath: "/",
  },
  resolve: {
    alias: {
      process: "process/browser",
    },
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
      os: require.resolve("os-browserify/browser"),
      https: require.resolve("https-browserify"),
      http: require.resolve("stream-http"),
      crypto: require.resolve("crypto-browserify"),
      browser: require.resolve("process/browser"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
      {
        test: /\.m?js/,
        type: "javascript/auto",
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.json/,
        resolve: {
          fullySpecified: false,
        },
        use: [
          {
            loader: "json-loader",
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: "asset/inline",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "..", "./public/index.html"),
      favicon: "./public/wdflogo.png", // your path to favicon
      filename: "index.html",
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new webpack.DefinePlugin({
      "process.env": {
        API_BASE_URL: JSON.stringify(process.env.API_BASE_URL),
        PINATA_API_KEY: JSON.stringify(process.env.PINATA_API_KEY),
        PINATA_API_SECRET_KEY: JSON.stringify(process.env.PINATA_API_SECRET_KEY),
        ALCHEMY_API_KEY: JSON.stringify(process.env.ALCHEMY_API_KEY),
        TOKEN_SECURITY_KEY: JSON.stringify(process.env.TOKEN_SECURITY_KEY),
        INIT_VECTOR: JSON.stringify(process.env.INIT_VECTOR),
        WEBSOCKET_URL: JSON.stringify(process.env.WEBSOCKET_URL),
        WDFS3URL: JSON.stringify(process.env.WDFS3URL),
      },
    }),
  ],
  stats: "errors-only",
};
