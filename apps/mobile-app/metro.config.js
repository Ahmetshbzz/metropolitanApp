//  "metro.config.js"
//  metropolitan app
//  Created by Ahmet on 29.06.2025.

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Monorepo support - workspace root'u bul
const workspaceRoot = path.resolve(__dirname, "../..");
const projectRoot = __dirname;

// Local shared alias
config.resolver.alias = {
  "@metropolitan/shared": path.resolve(projectRoot, "shared"),
};

// Disable package exports to fix Node 24 compatibility
config.resolver.unstable_enablePackageExports = false;

// Performance optimizations
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: false,
    mangle: {
      keep_fnames: false,
    },
    compress: {
      drop_console: process.env.NODE_ENV === "production", // Only remove console logs in production
      drop_debugger: true,
      pure_funcs: process.env.NODE_ENV === "production" ? ["console.log", "console.info", "console.debug"] : [],
    },
    output: {
      ascii_only: true,
      quote_style: 3,
      wrap_iife: true,
    },
  },
};

// Asset optimization
config.transformer.assetPlugins = [
  ...(config.transformer.assetPlugins || []),
  "expo-asset/tools/hashAssetFiles",
];

// Enable inline requires for better performance
config.transformer.allowOptionalDependencies = true;
config.resolver.allowOptionalDependencies = true;

// Cache configuration for faster rebuilds
// Removed custom cache configuration due to Metro compatibility issues

// Optimize bundle splitting
config.serializer = {
  ...config.serializer,
  processModuleFilter: (module) => {
    // Exclude test files from production bundle
    if (module.path.includes("__tests__") || module.path.includes(".test.")) {
      return false;
    }
    return true;
  },
};

module.exports = withNativeWind(config, { input: "./global.css" });
