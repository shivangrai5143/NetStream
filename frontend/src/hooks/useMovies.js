import { useState, useEffect, useCallback } from 'react';
import { movieAPI } from '../services/api';

export function useMovies() {
  const [state, setState] = useState({
    trending: [], popular: [], topRated: [],
    upcoming: [], nowPlaying: [],
    loading: true, error: null
  });

  const fetchAll = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const [trending, popular, topRated, upcoming, nowPlaying] = await Promise.all([
        movieAPI.getTrending({ type: 'all', window: 'week' }),
        movieAPI.getPopular({ type: 'movie' }),
        movieAPI.getTopRated({ type: 'movie' }),
        movieAPI.getUpcoming(),
        movieAPI.getNowPlaying(),
      ]);
      setState({
        trending: trending.data.results || [],
        popular: popular.data.results || [],
        topRated: topRated.data.results || [],
        upcoming: upcoming.data.results || [],
        nowPlaying: nowPlaying.data.results || [],
        loading: false,
        error: null
      });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: err.message }));
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return state;
}

export function useSearch(query, debounceMs = 400) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query?.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await movieAPI.search({ q: query });
        setResults((data.results || []).filter(r => r.media_type !== 'person'));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return { results, loading, error };
}

export function useInfiniteMovies(fetchFn, params = {}) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMore = useCallback(async (p = page) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const { data } = await fetchFn({ ...params, page: p });
      const results = data.results || [];
      setMovies(prev => p === 1 ? results : [...prev, ...results]);
      setTotalPages(data.total_pages || 1);
      setHasMore(p < (data.total_pages || 1));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchFn]);

  useEffect(() => { setMovies([]); setPage(1); setHasMore(true); fetchMore(1); }, [JSON.stringify(params)]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchMore(next);
  };

  return { movies, loading, hasMore, loadMore };
}
