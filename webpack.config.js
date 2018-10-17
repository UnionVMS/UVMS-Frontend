/* jshint node: true */
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// assets.js
const Assets = require('./assets');
const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
    entry: {
        app: "./app/app.js",
    },
    output: {
        path: __dirname + "/dist/",
        filename: "[name].bundle.js"
    },
    
    plugins: [
        new CopyWebpackPlugin(
            Assets.map(asset => {            
                const assetPath = 'modules';
                return {
                    from: path.resolve(__dirname, `./node_modules/${asset}`),
                    to: path.resolve(__dirname, `./app/assets/` + assetPath + '/' + `${asset}`)
                };
            })
        ),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
          })
    ],
    
    module: {        
        rules: [
          {
            test: /\.js$/,
            use: {
              loader: 'babel-loader',
            }
          },
          {
            test: /\.css$/,
            use: [
                devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                'css-loader',
                'postcss-loader',
                'sass-loader',
                'less-loader'
              ],
          },
          // Less to css
          {
            test: /\.less$/,
            use: [{
              loader: 'style-loader' // creates style nodes from JS strings
            }, {
              loader: 'css-loader' // translates CSS into CommonJS
            }, {
              loader: 'less-loader', // compiles Less to CSS
              options: {
                paths: [
                    path.resolve(__dirname, 'node_modules')
                ]
              }
            }]
          },
          {
            //sccs to css
            test: /\.(scss)$/,
            use: [
            {
                // Adds CSS to the DOM by injecting a `<style>` tag
                loader: 'style-loader'
            },
            {
                // Interprets `@import` and `url()` like `import/require()` and will resolve them
                loader: 'css-loader'
            },
            {
                // Loader for webpack to process CSS with PostCSS
                loader: 'postcss-loader',
                options: {
                plugins: function () {
                    return [
                    require('autoprefixer')
                    ];
                }
                }
            },
            {
                // Loads a SASS/SCSS file and compiles it to CSS
                loader: 'sass-loader'
            }
            ]
        },
        {
            test: /\.(png|svg|jpg|gif)$/,
            use: [{
                loader: 'file-loader'
                }
            ]
        }
        ]
    },    

};