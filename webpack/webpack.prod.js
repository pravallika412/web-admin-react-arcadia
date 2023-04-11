const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

module.exports = {
  mode: "production",
  devtool: "source-map",
  plugins: [
    new webpack.DefinePlugin({
      "process.env.name": JSON.stringify("Codevolution"),
    }),
    new Dotenv({
      path: `.env`,
    }),
  ],
};
