const { removeModuleScopePlugin, override, babelInclude } = require("customize-cra");
const path = require("path");

module.exports = override(
  removeModuleScopePlugin(),        // (1)
  babelInclude([
    path.resolve("src"),
    path.resolve("../../src"),  // (2)
  ])
);
