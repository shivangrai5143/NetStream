import { useState, useEffect } from 'react';
import { historyService } from '../services/firestore';
import { movieAPI } from '../services/tmdb';
import { useAuth } from '../context/AuthContext';

export function useRecommendations() {
  const { user, activeProfile } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !activeProfile) return;

    const fetchRecs = async () => {
      setLoading(true);
      try {
        // 1. Get user hitory
        const history = await historyService.get(user.uid, activeProfile._id);
        if (!history || history.length === 0) {
          setRecommendations([]);
          return;
        }

        // 2. Extract top genres
        const genreCounts = {};
        history.forEach(item => {
          if (item.genre_ids) {
            item.genre_ids.forEach(id => {
              genreCounts[id] = (genreCounts[id] || 0) + 1;
            });
          }
        });

        // Get top 2 genres
        const topGenres = Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(entry => entry[0]);

        if (topGenres.length === 0) return;

        // 3. Discover movies with these genres
        const res = await movieAPI.discoverByGenre(topGenres.join(','));
        
        // Filter out movies already watched
        const watchedIds = new Set(history.map(i => String(i.movieId)));
        const finalRecs = res.data.results.filter(movie => !watchedIds.has(String(movie.id)));

        setRecommendations(finalRecs.slice(0, 20)); // Return top 20
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, [user, activeProfile]);

  return { recommendations, loading };
}
