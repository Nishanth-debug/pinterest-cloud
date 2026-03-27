/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tells the compiler to leave these heavy Node libraries alone
  serverExternalPackages: ['potrace', 'jimp'],
  experimental: {
    serverComponentsExternalPackages: ['potrace', 'jimp'],
  }
};

export default nextConfig;