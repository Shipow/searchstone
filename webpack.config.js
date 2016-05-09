
var webpack = require("webpack");
var path = require("path");

module.exports = {
    entry: './src/js/app.js',
    output: {
        path: __dirname,
        filename: 'app.js'
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
        })
    ]
};
