/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/s/:token",
        destination: "/api/sign?token=:token",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/carta/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
