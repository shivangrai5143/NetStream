/**
 * Utility to generate Cloudinary Fetch URLs for TMDB images
 * This acts as a CDN proxy for TMDB images, caching them on Cloudinary.
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const TMDB_IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p';

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  
  const tmdbUrl = `${TMDB_IMAGE_BASE}/${size}${path}`;
  
  // If no cloud name is configured, fallback to direct TMDB URL
  if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME_HERE') {
    return tmdbUrl;
  }
  
  // Return Cloudinary Fetch Proxy URL
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${tmdbUrl}`;
};
