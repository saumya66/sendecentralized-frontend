/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
}

module.exports = {
    nextConfig,
    images: { loader: "custom" },
    env: {
        PINATA_API_KEY: "d5dcdbaf28e5e337ef2d",
        PINATA_API_SECRET: "5748b0705ee42fca91ecbb4acbdaac71cc13cccacec9b6f0e72dc218f81f2c07",
    },
}
