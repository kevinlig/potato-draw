const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, './src'),
    entry: {
        vendor: ['fabric', 'three'],
        app: './main.js'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '',
        filename: 'js/[name].js'
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        modules: [
            path.resolve(__dirname, './src/js'),
            path.resolve(__dirname, './node_modules'),
            path.resolve(__dirname, './src/scss')
        ],
        alias: {
            ThreeExtras: path.resolve(__dirname, './node_modules/three/examples/js')
        }
    },
    module: {
        loaders: [
            {
                test: /.node$/,
                use: 'node-loader'
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: path.resolve(__dirname, './cache'),
                    compact: true
                }
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                includePaths: ['./src/scss']
                            }
                        }
                    ]
                })
            },
            {
                include: /assets(\/|\\)/,
                loader: 'file-loader',
                query: {
                    name: '[path][name].[ext]'
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist', 'cache'], {
            root: path.resolve(__dirname)
        }),
        new ExtractTextPlugin({
            filename: 'css/style.css',
            allChunks: true
        }),
        new HtmlWebpackPlugin({
            inject: false,
            template: path.resolve(__dirname, './src/index.html'),
            filename: 'index.html'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'
        })
    ],
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        host: '0.0.0.0', // this allows VMs to access the server
        port: 3000,
        disableHostCheck: true
    }
};
