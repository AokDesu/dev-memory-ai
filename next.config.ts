import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Enable standalone output for Docker

  // @xenova/transformers uses native ONNX binaries that webpack cannot bundle.
  // Keep them as plain Node.js requires at runtime.
  serverExternalPackages: ['@xenova/transformers', 'onnxruntime-node'],

  // Raise the default 10MB body cap so project zip uploads up to 1 GB succeed.
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/middlewareClientMaxBodySize
  // (Not in the public NextConfig type yet, hence the cast.)
  ...({ middlewareClientMaxBodySize: '1gb' } as object),

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '1gb',
    },
  },
  
  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;