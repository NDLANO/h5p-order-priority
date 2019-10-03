const path = require('path');
const webpack = require('webpack');

const nodeEnv = process.env.NODE_ENV || 'development';
const isDev = (nodeEnv !== 'production');
const config = {
    entry: {
        'h5p-order-priority': [path.join(__dirname, 'src', 'app.js')]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    resolve: {
        modules: [
            path.resolve('./src'),
            path.resolve('./node_modules')
        ]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.(s*)css$/,
                include: path.resolve(__dirname, 'src'),
                use: ['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader']
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg|gif)$/,
                include: [
                    path.resolve(__dirname, 'src'),
                ],
                loader: 'url-loader?limit=100000'
            }
        ]
    },
    optimization: {
        splitChunks: {
            name: 'vendor',
            chunks: 'all',
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    }
};

if (isDev) {
    config.devtool = 'inline-source-map';
    // this fails when used in iframes. Uncomment next line and change embedType to 'div'
    // when developing to get accessibility feedback in the browser
    //config.entry["h5p-order-priority"].push(path.join(__dirname, 'src', 'axe.js'));
}

module.exports = config;
