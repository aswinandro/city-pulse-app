const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")

const config = getDefaultConfig(__dirname)

// Enable modern JavaScript features
config.resolver.sourceExts.push("mjs", "cjs")
config.resolver.platforms = ["native", "web", "ios", "android"]

// Optimize bundle size and performance
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
}

// Enable experimental features
config.transformer.unstable_allowRequireContext = true

module.exports = withNativeWind(config, {
  input: "./global.css",
  configPath: "./tailwind.config.js",
})
