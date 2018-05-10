const webpack = require('webpack')
const path = require('path')
const HtmlWebPackPlugin = require("html-webpack-plugin")

module.exports = {
  devtool: 'cheap-module-source-map',
  output: {
    chunkFilename: '[name].[chunkhash:5].chunk.js',
    publicPath: '/',
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true }
          }
        ]
      },
      {
        test: /containers\/([^/]+)\/?([^/]*)\.jsx?$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /containers\/app.js$/,
        use: ['bundle-loader?lazy', 'babel-loader']
      },
      {
        test: /\.js[x]?$/,
        use: [{
          loader: 'babel-loader'
        }],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      containers: path.join(__dirname, 'src/containers'),
      components: path.join(__dirname, 'src/components'),
      actions: path.join(__dirname, 'src/actions'),
      reducers: path.join(__dirname, 'src/reducers'),
      constants: path.join(__dirname, 'src/constants'),
      utils: path.join(__dirname, 'src/utils')
    }
  },
  devServer: {
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: 'index.html'
    })
  ]
}