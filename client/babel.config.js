module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo"]
    ],
    plugins: [
      "nativewind/babel",
      "@babel/plugin-transform-export-namespace-from",
      [
        "module:react-native-dotenv",
        {
          envName: "APP_ENV",
          moduleName: "@env",
          path: ".env",
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
