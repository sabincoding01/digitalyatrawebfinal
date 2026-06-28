import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking attacks
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // Prevent MIME type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Enable XSS protection in older browsers
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // Control referrer information
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Permissions policy — disable unused browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Force HTTPS for 1 year
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // DNS prefetch control
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://embed.tawk.to https://*.tawk.to https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.tawk.to",
      "font-src 'self' https://fonts.gstatic.com https://*.tawk.to",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com wss://*.firebaseio.com https://*.tawk.to wss://*.tawk.to https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.google.com https://api.web3forms.com https://region1.google-analytics.com https://firebasestorage.googleapis.com",
      "frame-src 'self' https://embed.tawk.to",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://api.web3forms.com",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  // Disable powered-by header
  poweredByHeader: false,
  // Compress responses
  compress: true,
  // Enable React strict mode for better error detection
  reactStrictMode: true,
  // Enable source maps for easier debugging
  productionBrowserSourceMaps: true,
};

export default nextConfig;
