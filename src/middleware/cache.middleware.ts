import { Request, Response, NextFunction } from 'express';
import { generateCacheControl } from '../config/cache.config';

export const cacheMiddleware = (type: 'staticAssets' | 'apiResponses') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    const cacheControl = generateCacheControl(type, environment);
    
    // Set cache control headers
    res.setHeader('Cache-Control', cacheControl);
    
    // Add ETag header for static assets
    if (type === 'staticAssets') {
      const etag = `"${Date.now()}"`; // In production, use content hash
      res.setHeader('ETag', etag);
      
      // Check if client sent If-None-Match header
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch === etag) {
        return res.status(304).end(); // Not Modified
      }
    }
    
    next();
  };
};

// Specific middleware for static assets
export const staticAssetsCache = cacheMiddleware('staticAssets');

// Specific middleware for API responses
export const apiCache = cacheMiddleware('apiResponses'); 