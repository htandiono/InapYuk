import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @inapyuk/types ships TypeScript-compiled CommonJS from the workspace.
  transpilePackages: ['@inapyuk/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

export default nextConfig;
