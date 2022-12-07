const path = require('path');
const webpack = require('webpack');
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

const deps = require("./package.json").dependencies;

const production = process.env.PRODUCTION === 'true';

const rules = [{
    test: /\.(js|jsx|ts|tsx)$/,
    exclude: /(node_modules)/,
    loader: 'babel-loader',
    options: { presets: ["@babel/env"] }
},
{
    test: /\.css$/,
    use: ["style-loader", "css-loader"]
},
{
    test: /\.js$/,
    exclude: /(node_modules\/react-leaflet-heatmap-layer-v3)/,
    enforce: 'pre',
    use: ['source-map-loader'],
},
{
    test: /.(png|svg|jpe?g|gif|woff2?|ttf|eot)$/,
    use: ['file-loader']
}]


module.exports = {
    entry: './src/index.tsx',
    mode: production ? 'production' : 'development',
    devtool: production ? undefined : 'source-map',
    module: {
        rules: rules
    },
    resolve: { extensions: ['*', '.js', '.jsx', '.ts', '.tsx'] },
    output: {
        filename: 'bundle.js'
    },
    devServer: {
        port: 3005,
        hot: true
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NEO4J_URI': JSON.stringify(process.env.NEO4J_URI),
            'process.env.NEO4J_PASSWORD': JSON.stringify(process.env.NEO4J_PASSWORD),
            'process.env.NEO4J_HOST': JSON.stringify(process.env.NEO4J_HOST),
          }),
        new ModuleFederationPlugin({
            name: "remoteNeodash",
            library: { type: "var", name: "remoteNeodash" },
            filename: "remoteEntry.js",
            remotes: {},
            exposes: {
                "./RemoteHeader": "./src/component/RemoteHeader.tsx",
                "./RemoteSingle": "./src/chart/single/SingleValueChart.tsx" ,
                "./RemoteGraph": "./src/chart/graph/GraphChart.tsx",
                "./RemotePie": "./src/chart/pie/PieChart.tsx",
                "./RemoteBar": "./src/chart/bar/BarChart.tsx",
            },
            shared: {
                react: {
                    shareKey: "react",
                    import: 'react',
                    shareScope: "default",
                    singleton: true,
                    requiredVersion: deps.react,
                  },
                  'react-dom': {
                    singleton: true,
                    requiredVersion: deps['react-dom'],
                  },
            },
          })
        ]
};