// API service is being broken down into Firebase and direct TMDB calls.
// Re-exporting movieAPI from our new TMDB service to avoid breaking existing imports.
import { movieAPI } from './tmdb';

export { movieAPI };

// Auth, Profile, Watchlist, and History APIs will be replaced by Firestore services
// For now, we stub them to not crash the app while we migrate.
const stub = async () => ({ data: { success: true, results: [], items: [], profiles: [] } });

export const authAPI = {
  signup: stub,
  login: stub,
  logout: stub,
  getMe: async () => { throw new Error('migrating'); }
};

export const profileAPI = {
  getAll: stub,
  create: stub,
  update: stub,
  delete: stub
};

export const watchlistAPI = {
  get: stub,
  add: stub,
  remove: stub,
  check: stub
};

export const historyAPI = {
  get: stub,
  add: stub,
  remove: stub,
  clear: stub
};
