// Cache configuration for different environments
export const cacheConfig = {
  development: {
    // Development environment cache settings
    staticAssets: {
      maxAge: 0, // No caching in development
      staleWhileRevalidate: 0,
    },
    apiResponses: {
      maxAge: 0,
      staleWhileRevalidate: 0,
    },
  },
  production: {
    // Production environment cache settings
    staticAssets: {
      maxAge: 31536000, // 1 year in seconds
      staleWhileRevalidate: 86400, // 1 day in seconds
    },
    apiResponses: {
      maxAge: 300, // 5 minutes
      staleWhileRevalidate: 60, // 1 minute
    },
  },
};

// Cache control headers generator
export const generateCacheControl = (
  type: 'staticAssets' | 'apiResponses',
  environment: 'development' | 'production' = 'production'
) => {
  const config = cacheConfig[environment][type];
  return `public, max-age=${config.maxAge}, stale-while-revalidate=${config.staleWhileRevalidate}`;
};

// Version hash generator for static assets
export const generateVersionHash = (content: string): string => {
  // Simple hash function - in production, use a more robust solution
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}; 