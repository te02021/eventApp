/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Para las fotos de eventos/paisajes
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com", // Para los avatares de usuarios
      },
      {
        protocol: "https",
        hostname: "v0.dev", // Por si quedó alguna imagen residual de v0
      },
    ],
  },
};

export default nextConfig;
