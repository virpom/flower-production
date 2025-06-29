/** @type {import('next').NextConfig} */
const nextConfig = {
  // Включаем standalone output для Docker
  output: 'standalone',
  
  // Оптимизация изображений
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Экспериментальные функции
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  
  // Компилятор
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Игнорируем ошибки для быстрой сборки
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Webpack конфигурация
  webpack: (config, { isServer }) => {
    // Исключаем некоторые зависимости для серверной части
    if (isServer) {
      config.externals.push('_http_common');
    }
    
    return config;
  },
};

module.exports = nextConfig;
