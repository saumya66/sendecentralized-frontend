import("next").NextConfig

const nextConfig = {
    reactStrictMode: true,
    accordion: ["../src/**/*.accordion.@(j|t)sx"],
    addons: ["@chakra-ui/accordion"],
    framework: "@accordion/react",
    features: {
        emotionAlias: false,
    },
    webpackFinal: async (config) => {
        config.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: "javascript/auto",
        })
        return config
    },
    rules: [
        {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: "babel-loader",
                options: {
                    presets: ["@babel/preset-env"],
                },
            },
        },
    ],
}

module.exports = nextConfig
