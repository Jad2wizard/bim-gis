const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
// const BundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const {port} = JSON.parse(fs.readFileSync('./config.json'))
console.log(port)

module.exports = (env, argv) => {
    const isDev = argv.mode === 'development'
    const config = {
        context: __dirname,
        entry: {
            main: isDev
                ? [
                      'eventsource-polyfill',
                      `webpack-hot-middleware/client?path=http://127.0.0.1:${port}/__webpack_hmr&timeout=20000`,
                      './src/index.js'
                  ]
                : ['./src/index.js']
        },
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'res/js'),
            publicPath: '/js/'
        },
        resolve: {
            alias: {
                'three-examples': path.join(
                    __dirname,
                    './node_modules/three/examples/js'
                )
            },
            extensions: ['.js', '.jsx']
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.(css)/,
                    loader: 'style-loader!css-loader'
                },
                {
                    test: /\.(less)/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                                context: __dirname,
                                localIdentName:
                                    '[path][name]--[local]--[hash:base64:5]'
                            }
                        },
                        'less-loader'
                    ]
                },
                {
                    test: /\.(png|jpg)/,
                    loader: 'url-loader?limit=8192'
                },
                {
                    test: /\.worker\.js$/,
                    loader: 'worker-loader',
                    options: {
                        inline: true,
                        fallback: false
                    }
                }
            ]
        },
        plugins: [
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require(__dirname + '/res/js/manifest.json')
            })
        ]
    }

    if (isDev) {
        config.devtool = 'inline-source-map'
        config.mode = 'development'
        config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin())
        config.plugins.push(new webpack.HotModuleReplacementPlugin())
    } else {
        config.mode = 'production'
        // config.plugins.push(new BundleAnalyzer())
    }
    return config
}
