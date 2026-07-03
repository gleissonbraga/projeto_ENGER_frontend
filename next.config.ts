import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Toda vez que o Front-end chamar /api/...
        source: '/api/:path*',
        // O Next.js vai redirecionar por debaixo dos panos para o Render
        destination: 'https://enger-api.onrender.com/api/:path*', 
      },
    ]
  },
};

export default nextConfig;
