/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.ttf$/,
      type: 'asset/resource',
    });
    
    // Fix for undici module parsing error
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    return config;
  },
  serverExternalPackages: ['monaco-editor'],
  // Transpile undici and firebase to fix the private field syntax issue
  transpilePackages: ['undici', 'firebase'],
}

module.exports = nextConfig