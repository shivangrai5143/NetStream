import { useState, useEffect } from 'react';
import HeroBanner from '../components/movie/HeroBanner';
import MovieRow from '../components/movie/MovieRow';
import { useRecommendations } from '../hooks/useRecommendations';
import { historyService, adminService } from '../services/firestore';
import { movieAPI } from '../services/tmdb';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user, activeProfile } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Custom rows
  const { recommendations } = useRecommendations();
  const [continueWatching, setContinueWatching] = useState([]);
  const [featuredAdmin, setFeaturedAdmin] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          trending, popular, topRated, upcoming, adminPicks
        ] = await Promise.all([
          movieAPI.getTrending(),
          movieAPI.getPopular(),
          movieAPI.getTopRated(),
          movieAPI.getUpcoming(),
          adminService.getFeatured()
        ]);
        
        // Map adminPicks to standard movie format if needed
        const mappedAdminPicks = adminPicks.map(p => ({
          ...p,
          id: p.movieId, // ensure id matches TMDB format
        }));

        setContent({
          hero: mappedAdminPicks.length > 0 ? mappedAdminPicks : trending.data.results,
          trending: trending.data.results,
          popular: popular.data.results,
          topRated: topRated.data.results,
          upcoming: upcoming.data.results
        });

        setFeaturedAdmin(mappedAdminPicks);

      } catch (err) {
        console.error('Failed to fetch content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Fetch Continue Watching separately since it depends on active profile
  useEffect(() => {
    if (user && activeProfile) {
      historyService.get(user.uid, activeProfile._id).then(history => {
        // Filter out movies that are finished (>95%) or barely started (<2%)
        const inProgress = history.filter(h => h.progress > 2 && h.progress < 95);
        setContinueWatching(inProgress.map(h => ({
          ...h, 
          id: h.movieId // normalize ID for MovieRow
        })));
      });
    }
  }, [user, activeProfile]);

  const sections = [
    { title: 'Continue Watching', movies: continueWatching, type: 'all' },
    { title: 'Recommended For You', movies: recommendations, type: 'all' },
    { title: 'Staff Picks', movies: featuredAdmin, type: 'all' },
    { title: '🔥 Trending Now', movies: content?.trending, type: 'all' },
    { title: '⭐ Top Rated', movies: content?.topRated, type: 'movie' },
    { title: '🎞 Popular Movies', movies: content?.popular, type: 'movie' },
    { title: '🗓 Coming Soon', movies: content?.upcoming, type: 'movie' },
  ].filter(section => section.movies && section.movies.length > 0);

  return (
    <div className="min-h-screen bg-netflix-black">
      <HeroBanner movies={content?.hero} loading={loading} />

      {/* Movie rows */}
      <div className="relative z-10 -mt-24 pb-16 space-y-2">
        {sections.map((section, idx) => (
          <div 
            key={section.title}
            className="animate-slide-up opacity-0"
            style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'forwards' }}
          >
            <MovieRow 
              title={section.title} 
              movies={section.movies} 
              mediaType={section.type} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
