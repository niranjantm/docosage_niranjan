/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images :{
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/health_records/**',
      },
    ], // Add other domains if needed
  },
};

  


export default nextConfig;
