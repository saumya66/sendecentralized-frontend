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
}

module.exports = nextConfig
