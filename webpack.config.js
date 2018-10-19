const webpack = require('webpack');

module.exports = {
    devtool: 'eval-source-map',
    entry: {
        main:__dirname + "/app/main.js", //已多次提及的唯一入口文件
        setting:__dirname + "/app/setting.js", //已多次提及的唯一入口文件
    },
    output: {
        path: __dirname + "/public", //打包后的文件存放的地方
        filename: "[name].bundle.js" //打包后输出文件的文件名
    },

    devServer: {
        contentBase: "./public", //本地服务器所加载的页面所在的目录
        historyApiFallback: true, //不跳转
        inline: true, //实时刷新
        port: 9000,
        hot: true
    },
    module: {
        rules: [{
                test: /(\.jsx|\.js)$/,
                use: {
                    loader: "babel-loader"
                },
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }]
            },
            {
                test: /\.(htm|html)$/,
                use: [
                    'raw-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                  {
                    loader: 'file-loader',
                    options: {}
                  }
                ]
              }
        ]
    },
    plugins: [
        new webpack.BannerPlugin('版权所有，翻版必究'),
        new webpack.HotModuleReplacementPlugin(), //热加载插件
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ]
}