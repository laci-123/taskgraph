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
                "manifest.json",
                "sw.js",
                "css/*",
                {
                    from: "node_modules/react-day-picker/dist/style.css",
                    to: "css/react-day-picker/dist/style.css"
                },
                "img/*.png"
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
