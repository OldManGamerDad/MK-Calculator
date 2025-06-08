// ./customPlugins/jsx-runtime-patch.js
// This patch ensures React internals are properly initialized before JSX runtime is loaded
const React = require('react');

// Make sure SECRET_INTERNALS are available
if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
    ReactCurrentOwner: {
      current: null
    },
    ReactCurrentDispatcher: {
      current: null
    },
    ReactCurrentBatchConfig: {
      transition: null
    }
  };
}

module.exports = React;