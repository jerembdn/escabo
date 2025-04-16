const { withKitchnConfig } = require('kitchn/next');

/** @type {import('next').NextConfig} */ 
const config = {
  reactStrictMode: process.env.NODE_ENV === "development",
  env: {
      NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
  },
};

module.exports = withKitchnConfig(config);