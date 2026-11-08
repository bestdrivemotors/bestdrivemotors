/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: process.env.R2_PUBLIC_BASE_URL
      ? (() => {
          const url = new URL(process.env.R2_PUBLIC_BASE_URL);
          return [{ protocol: url.protocol.slice(0, -1), hostname: url.hostname, pathname: '/**' }];
        })()
      : [],
  },
};

export default nextConfig;
