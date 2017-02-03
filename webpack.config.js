module.exports = require('./config/webpack.dev.js');

/*
module.exports = {
    entry: "./app/main.ts",
    output: {
        path: "./dist",
        filename: "bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader'],
                exclude: [/\.(spec|e2e)\.ts$/]
            },
            {
                test: /\.(html|css)$/,
                loader: 'raw-loader'
            }
        ]
    }    
};

*/