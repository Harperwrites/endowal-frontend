/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backend = process.env.ENDOWAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://endowal-api.onrender.com";
    const origin = new URL(backend);
    if (!["http:", "https:"].includes(origin.protocol)) throw new Error("Invalid backend URL");
    return [{ source: "/api/backend/:path*", destination: `${origin.origin}/:path*` }];
  }
};

export default nextConfig;
