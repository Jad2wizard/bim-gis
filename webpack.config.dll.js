/**
 * Created by yaojia on 2019/4/2.
 */
const webpack = require('webpack');
const vendors = [
    'react',
    'react-dom',
    'react-router',
    'redux',
    'react-redux',
    'react-router-redux',
    'redux-logger',
    'redux-saga',
    'reselect',
    'moment',
    'three'
];

module.exports = {
    entry: {
        "lib": vendors
    },
    output: {
        path: __dirname + '/res/js',
        filename: '[name].js',
        library: '[name]'
    },
    module: {
        rules: [
            {
                test: /\.(jsx|js)/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.(css)/,
                loader: "style-loader!css-loader?modules&localIdentName=[path][name]--[local]--[hash:base64:5]"
            },
            {
                test: /\.(less)/,
                loader: "style-loader!css-loader?modules&localIdentName=[path][name]--[local]--[hash:base64:5]!less-loader"
            },
            {
                test: /\.(png|jpg)/,
                loader: 'url-loader?limit=8192'
            }
        ]
    },
    plugins: [
        new webpack.DllPlugin({
            path: __dirname + '/res/js/manifest.json',
            name: '[name]',
            context: __dirname
        })
    ]
}
