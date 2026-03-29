const axios = require('axios');

const tmdbClient = axios.create({
  baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  params: { api_key: process.env.TMDB_API_KEY }
});

const tmdb = {
  getTrending: (mediaType = 'movie', timeWindow = 'week', page = 1) =>
    tmdbClient.get(`/trending/${mediaType}/${timeWindow}`, { params: { page } }),

  getPopular: (mediaType = 'movie', page = 1) =>
    tmdbClient.get(`/${mediaType}/popular`, { params: { page } }),

  getTopRated: (mediaType = 'movie', page = 1) =>
    tmdbClient.get(`/${mediaType}/top_rated`, { params: { page } }),

  getUpcoming: (page = 1) =>
    tmdbClient.get('/movie/upcoming', { params: { page } }),

  getNowPlaying: (page = 1) =>
    tmdbClient.get('/movie/now_playing', { params: { page } }),

  getMovieDetails: (movieId) =>
    tmdbClient.get(`/movie/${movieId}`, {
      params: { append_to_response: 'credits,videos,similar,recommendations' }
    }),

  getTVDetails: (tvId) =>
    tmdbClient.get(`/tv/${tvId}`, {
      params: { append_to_response: 'credits,videos,similar,recommendations' }
    }),

  search: (query, page = 1) =>
    tmdbClient.get('/search/multi', { params: { query, page, include_adult: false } }),

  getGenres: (mediaType = 'movie') =>
    tmdbClient.get(`/genre/${mediaType}/list`),

  discoverByGenre: (genreId, mediaType = 'movie', page = 1) =>
    tmdbClient.get(`/discover/${mediaType}`, {
      params: { with_genres: genreId, page, sort_by: 'popularity.desc' }
    }),

  getVideos: (movieId, mediaType = 'movie') =>
    tmdbClient.get(`/${mediaType}/${movieId}/videos`),
};

module.exports = tmdb;
