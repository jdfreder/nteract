const baseConfig = require('./babel.config');

module.exports = function(api) {
  const config = baseConfig(api);
  return {
    ...config,
    presets: [...config.presets, "@babel/preset-flow"],
    plugins: [
      "@babel/plugin-transform-flow-strip-types",
      ...config.plugins,
    ]
  };
};
