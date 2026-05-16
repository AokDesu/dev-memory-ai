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
  
  // CORS is only applied to the /external/* surface — SDK callers are normally
  // server/CLI tools (no CORS enforcement), but a wildcard is fine here because
  // the routes require a Bearer API key. Internal routes (UI/dashboard) stay
  // same-origin-only by default, which is the security boundary for paths and
  // other sensitive fields they expose.
  async headers() {
    return [
      {
        source: '/api/external/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;