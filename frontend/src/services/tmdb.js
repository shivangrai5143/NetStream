import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY
  }
});

// Helper to extract data
const get = async (url, params = {}) => {
  const res = await tmdbClient.get(url, { params });
  return { data: res.data }; // Wrap in { data } to match previous API format
};

export const movieAPI = {
  getTrending: (params) => {
    const type = params?.type === 'all' ? 'all' : (params?.type || 'movie');
    const window = params?.window || 'week';
    return get(`/trending/${type}/${window}`, params);
  },
  getPopular: (params) => {
    const type = params?.type || 'movie';
    return get(`/${type}/popular`, params);
  },
  getTopRated: (params) => {
    const type = params?.type || 'movie';
    return get(`/${type}/top_rated`, params);
  },
  getUpcoming: (params) => get('/movie/upcoming', params),
  getNowPlaying: (params) => get('/movie/now_playing', params),
  getMovieDetails: (id) => get(`/movie/${id}`, { append_to_response: 'videos,credits,similar,recommendations' }),
  getTVDetails: (id) => get(`/tv/${id}`, { append_to_response: 'videos,credits,similar,recommendations' }),
  search: (params) => get('/search/multi', { query: params?.q, ...params }),
  getVideos: (id, type = 'movie') => get(`/${type}/${id}/videos`),
  getGenres: (type = 'movie') => get(`/genre/${type}/list`),
  discoverByGenre: (genreId, type = 'movie', page = 1) => get(`/discover/${type}`, { with_genres: genreId, page })
};
