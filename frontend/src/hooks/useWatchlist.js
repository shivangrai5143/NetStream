import { useState, useEffect, useCallback } from 'react';
import { watchlistService } from '../services/firestore';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function useWatchlist() {
  const { activeProfile, user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const profileId = activeProfile?._id;

  const fetchWatchlist = useCallback(async () => {
    if (!profileId || !user) return;
    setLoading(true);
    try {
      const items = await watchlistService.get(user.uid, profileId);
      setWatchlist(items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [profileId, user]);

  useEffect(() => { fetchWatchlist(); }, [fetchWatchlist]);

  const isInWatchlist = useCallback(
    (movieId) => watchlist.some(item => item.movieId === movieId),
    [watchlist]
  );

  const toggle = useCallback(async (movie, mediaType = 'movie') => {
    if (!profileId || !user) return toast.error('Select a profile first');
    const movieId = movie.id || movie.movieId;
    const inList = isInWatchlist(movieId);
    try {
      if (inList) {
        await watchlistService.remove(user.uid, profileId, movieId);
        setWatchlist(prev => prev.filter(i => String(i.movieId) !== String(movieId)));
        toast.success('Removed from My List');
      } else {
        const item = await watchlistService.add(user.uid, profileId, {
          movieId,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          overview: movie.overview,
          vote_average: movie.vote_average,
          release_date: movie.release_date || movie.first_air_date,
          media_type: mediaType,
          genre_ids: movie.genre_ids || [],
        });
        setWatchlist(prev => [item, ...prev]);
        toast.success('Added to My List');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  }, [profileId, user, isInWatchlist]);

  return { watchlist, loading, isInWatchlist, toggle, refetch: fetchWatchlist };
}
