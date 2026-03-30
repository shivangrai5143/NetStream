import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiInfo, FiPlus, FiCheck } from 'react-icons/fi';
import { watchlistAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

export default function HeroBanner({ movies = [], loading = false }) {
  const navigate = useNavigate();
  const { activeProfile } = useAuth();
  const [current, setCurrent] = useState(0);
  const [inList, setInList] = useState(false);

  const movie = movies[current];

  // Rotate hero every 8s
  useEffect(() => {
    if (movies.length < 2) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % Math.min(movies.length, 5)), 8000);
    return () => clearInterval(t);
  }, [movies.length]);

  const handleWatchlist = async () => {
    if (!activeProfile || !movie) return;
    try {
      if (inList) {
        await watchlistAPI.remove(movie.id, activeProfile._id);
        setInList(false);
        toast.success('Removed from My List');
      } else {
        await watchlistAPI.add({
          profileId: activeProfile._id,
          movieId: movie.id,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          overview: movie.overview,
          vote_average: movie.vote_average,
          release_date: movie.release_date || movie.first_air_date,
          media_type: movie.media_type || 'movie',
          genre_ids: movie.genre_ids || [],
        });
        setInList(true);
        toast.success('Added to My List');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="relative w-full h-[85vh] bg-gray-900 shimmer">
        <div className="absolute bottom-32 left-4 md:left-16 space-y-4 w-full max-w-xl px-4">
          <div className="h-14 w-3/4 skeleton rounded" />
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-2/3 skeleton rounded" />
          <div className="flex gap-3 mt-4">
            <div className="h-11 w-28 skeleton rounded" />
            <div className="h-11 w-32 skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const title = movie.title || movie.name;
  const backdrop = movie.backdrop_path ? `${BACKDROP_BASE}${movie.backdrop_path}` : null;
  const overview = movie.overview?.slice(0, 200) + (movie.overview?.length > 200 ? '...' : '');
  const year = (movie.release_date || movie.first_air_date)?.slice(0, 4);
  const rating = movie.vote_average?.toFixed(1);
  const mediaType = movie.media_type || 'movie';

  return (
    <div className="relative w-full h-[85vh] overflow-hidden">
      {/* Backdrop */}
      {backdrop && (
        <div
          key={movie.id}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{ backgroundImage: `url(${backdrop})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-netflix-black/30 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full pb-32 md:pb-40 px-4 md:px-16 max-w-2xl">
        <div className="animate-slide-up">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-3">
            {rating && (
              <span className="text-green-400 font-semibold text-sm">{rating} ★</span>
            )}
            {year && <span className="text-gray-300 text-sm">{year}</span>}
            <span className="border border-gray-500 text-gray-300 text-xs px-1.5 py-0.5 rounded">
              {mediaType === 'tv' ? 'TV' : 'FILM'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-2xl">
            {title}
          </h1>

          {/* Overview */}
          <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-6 max-w-lg">
            {overview}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate(`/watch/${mediaType}/${movie.id}`)}
              className="btn-netflix text-base px-8 py-3"
            >
              <FiPlay fill="currentColor" size={20} /> Play
            </button>
            <button
              onClick={() => navigate(`/${mediaType}/${movie.id}`)}
              className="btn-secondary text-base px-6 py-3"
            >
              <FiInfo size={20} /> More Info
            </button>
            <button
              onClick={handleWatchlist}
              className="border-2 border-white/60 hover:border-white text-white rounded-full p-3 transition-colors bg-black/30 backdrop-blur-sm"
              title={inList ? 'Remove from list' : 'Add to My List'}
            >
              {inList ? <FiCheck size={20} /> : <FiPlus size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-20 right-4 md:right-16 flex gap-1.5 z-10">
        {movies.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-0.5 rounded-full transition-all duration-300 ${
              i === current ? 'bg-white w-6' : 'bg-gray-500 w-3'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
