// Mock implementation for asset registry
module.exports = {
  registerAsset: () => {
    return {
      __packager_asset: true,
      fileSystemLocation: "",
      httpServerLocation: "",
      width: 1,
      height: 1,
      scales: [1],
      hash: "",
      name: "",
      type: ""
    };
  }
};