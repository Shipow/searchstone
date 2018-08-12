
const webpack = require("webpack");
const path = require("path");


module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    app: './src/js/app.js',
  },
  output: {
    path: __dirname,
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader'
      }        ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $ : "jquery",
      jQuery : "jquery",
      "window.jQuery" : "jquery",
      "root.jQuery" : "jquery"
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    })
  ]
};
