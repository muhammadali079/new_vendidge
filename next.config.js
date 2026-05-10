/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // Change this to false to enable PWA testing on localhost
  disable: process.env.NODE_ENV === "development" ? false : false,
  runtimeCaching: [], // Optional: add custom caching rules here
  publicExcludes: [
    "!nprogress/nprogress.css",
    "!sw.js",
    "!sw.js.map",
    "!workbox-*.js",
  ],
  buildExcludes: [/middleware-manifest\.json$/, /_next\/static\/.*\.js$/],
});

module.exports = withPWA({
  reactStrictMode: true,
  // This explicitly allows the use of Webpack-based plugins
  webpack: (config) => {
    return config;
  },
});
