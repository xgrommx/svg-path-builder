import path from "path"
import webpack from "webpack"
import ExtractTextPlugin from "extract-text-webpack-plugin"

import autoprefixer from "autoprefixer"
import stylelint from "stylelint"
import postcssBrandColors from "postcss-brand-colors"
import postcssColorFunction from "postcss-color-function"
import postcssCustomMedia from "postcss-custom-media"
import postcssCustomProperties from "postcss-custom-properties"
import postcssCustomSelectors from "postcss-custom-selectors"
import postcssImport from "postcss-import"
import postcssInputStyle from "postcss-input-style"
import postcssMediaMinmax from "postcss-media-minmax"
import postcssUrl from "postcss-url"

import variables, { defineVariables } from "./variables"

defineVariables()

export default {
    entry: {
        index: [
            "./src/index.js",
        ],
    },
    output: {
        path: path.join(__dirname, __OUTPUT_DIR__),
        publicPath: `${__SERVER_URL__}/${__OUTPUT_DIR__}/`,
        filename: "bundle.js",
    },
    resolve: {
        extensions: [
            "",
            ".js",
            ".css",
        ],
    },
    module: {
        loaders: [
            // js files
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: [
                    "babel",
                    "eslint",
                ],
            },
            // css files
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract(
                    "style",
                    "css!postcss"
                ),
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin(variables),
        new ExtractTextPlugin("styles.css", {
            disable: __DEV__,
        }),
        ...(__PROD__ ? [
            new webpack.optimize.UglifyJsPlugin({
                compress: { warnings: false },
            }),
        ] : [])
    ],
    eslint: {
        configFile: "./.eslintrc",
    },
    postcss: (webpack) => {
        return [
            postcssImport({ addDependencyTo: webpack }),
            stylelint,
            postcssCustomMedia,
            postcssCustomProperties,
            postcssCustomSelectors,
            postcssMediaMinmax,
            postcssBrandColors,
            postcssColorFunction,
            postcssInputStyle,
            postcssUrl,
        ]
    }
}
