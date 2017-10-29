
var webpack = require("webpack");
var path = require("path");

module.exports = {
  devtool: 'source-map',
  entry: {
    app: './src/js/app.js',
    sw: './src/js/sw/index.js',
  },
  output: {
    path: __dirname,
    filename: '[name].js'
  },
  module: {
    loaders: [
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
