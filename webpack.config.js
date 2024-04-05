const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/index.tsx',
    devtool: false,
    module: {
        rules: [
            {
                test: /\.tsx?/,
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
        extensions: ['.tsx', '.ts'],
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
