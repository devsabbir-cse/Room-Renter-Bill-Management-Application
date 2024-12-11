module.exports = {
    reactStrictMode: false, // This is enabled by default in Next.js development mode
  }
  


  // next.config.js
module.exports = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8081/:path*', // Proxy to backend
        },
      ];
    },
  };
  