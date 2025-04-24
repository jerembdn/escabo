const { withKitchnConfig } = require("kitchn/next");

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: process.env.NODE_ENV === "development",
  env: {
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
  },
  compiler: {
    styledComponents: true,
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/ladder/tft/ranked_tft",
        permanent: true,
      },
      {
        source: "/ladder",
        destination: "/ladder/tft/ranked_tft",
        permanent: true,
      },
    ];
  },
};

module.exports = withKitchnConfig(config);
