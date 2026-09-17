/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const isGithubActions = process.env.GITHUB_ACTIONS || false;

let basePath = '';
let assetPrefix = '';

if (isGithubActions) {
  // Extract repository name from GitHub environment
  const repo = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}` : '/EpiLog';
  basePath = repo;
  assetPrefix = repo;
} else if (isProd) {
  basePath = '/EpiLog';
  assetPrefix = '/EpiLog';
}

const nextConfig = {
  output: 'export',
  basePath: basePath,
  assetPrefix: assetPrefix,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
