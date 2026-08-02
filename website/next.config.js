/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/Crescent-JS' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Crescent-JS/' : '',
};

module.exports = nextConfig;