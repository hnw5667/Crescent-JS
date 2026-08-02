/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/crescent-js' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/crescent-js/' : '',
};

module.exports = nextConfig;