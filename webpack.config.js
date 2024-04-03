const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        allowTsInNodeModules: true,
                    }
                }
            }
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                "index.html",
                "css/*"
            ],
        }),
    ],
    resolve: {
        extensions: ['.ts'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    optimization:
    {
        usedExports: true 
    },
    mode: "development"
};
