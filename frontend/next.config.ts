/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "minios3.cliick.dev.br"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/api/files/**",
      },
      {
        protocol: "https",
        hostname: "minios3.cliick.dev.br",
        port: "",
        pathname: "/submita-images/**",
      },
      {
        protocol: "https",
        hostname: "minios3.cliick.dev.br",
        port: "",
        pathname: "/submita-pdfs/**",
      },
    ],
  },
  env: {
    CUSTOM_KEY: "SUBMITA_BIOPARK",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
