import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieAPI } from '../services/tmdb';
import { useWatchlist } from '../hooks/useWatchlist';
import MovieRow from '../components/movie/MovieRow';
import ReviewsSection from '../components/movie/ReviewsSection';
import {
  FiPlay, FiPlus, FiCheck, FiStar, FiCalendar,
  FiClock, FiGlobe, FiArrowLeft
} from 'react-icons/fi';
import { getImageUrl } from '../utils/imageUtils';



export default function MovieDetailPage({ type = 'movie' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggle } = useWatchlist();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setShowTrailer(false);
    const fetch = type === 'movie' ? movieAPI.getMovieDetails : movieAPI.getTVDetails;
    fetch(id)
      .then(({ data }) => {
        setMovie(data);
        const trailer = data.videos?.results?.find(
          v => v.type === 'Trailer' && v.site === 'YouTube'
        ) || data.videos?.results?.[0];
        setTrailerKey(trailer?.key || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, type]);

  if (loading) return <DetailSkeleton />;
  if (!movie) return <div className="min-h-screen bg-netflix-black flex items-center justify-center text-white">Movie not found</div>;

  const title = movie.title || movie.name;
  const backdrop = movie.backdrop_path ? getImageUrl(movie.backdrop_path, 'original') : null;
  const poster = movie.poster_path ? getImageUrl(movie.poster_path, 'w500') : null;
  const year = (movie.release_date || movie.first_air_date)?.slice(0, 4);
  const rating = movie.vote_average?.toFixed(1);
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : movie.episode_run_time?.[0] ? `${movie.episode_run_time[0]}m/ep` : null;
  const genres = movie.genres?.map(g => g.name) || [];
  const cast = movie.credits?.cast?.slice(0, 10) || [];
  const similar = movie.similar?.results?.slice(0, 12) || [];
  const recommendations = movie.recommendations?.results?.slice(0, 12) || [];
  const inList = isInWatchlist(movie.id);

  const tabs = ['overview', 'cast', 'reviews', 'similar'];

  return (
    <div className="min-h-screen bg-netflix-black animate-fade-in">
      {/* Backdrop */}
      <div className="relative w-full h-[55vh] md:h-[70vh] overflow-hidden">
        {showTrailer && trailerKey ? (
          <div className="absolute inset-0 bg-black z-10">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1&rel=0`}
              allow="autoplay; fullscreen"
              allowFullScreen
              title="Trailer"
            />
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black z-20"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            {backdrop && (
              <img src={backdrop} alt={title} className="w-full h-full object-cover object-top" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-netflix-black/60 to-transparent" />
          </>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-24 left-4 md:left-8 z-20 flex items-center gap-2 text-white bg-black/40 hover:bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full transition-colors text-sm"
        >
          <FiArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Main content */}
      <div className="px-4 md:px-16 -mt-32 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 hidden md:block">
            <div className="w-52 rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
              {poster ? (
                <img src={poster} alt={title} className="w-full" />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center text-gray-500">No Image</div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 md:pt-8">
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-3">
              {genres.map(g => (
                <span key={g} className="text-xs border border-gray-600 text-gray-300 px-2.5 py-1 rounded-full">{g}</span>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">{title}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {rating && (
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <FiStar size={18} fill="currentColor" />
                  <span className="font-bold text-lg">{rating}</span>
                  <span className="text-gray-400 text-sm">/ 10</span>
                </div>
              )}
              {year && (
                <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                  <FiCalendar size={14} /> {year}
                </div>
              )}
              {runtime && (
                <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                  <FiClock size={14} /> {runtime}
                </div>
              )}
              {movie.original_language && (
                <div className="flex items-center gap-1.5 text-gray-300 text-sm uppercase">
                  <FiGlobe size={14} /> {movie.original_language}
                </div>
              )}
              {movie.status && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  movie.status === 'Released' || movie.status === 'Ended'
                    ? 'bg-green-900/50 text-green-400 border border-green-800'
                    : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                }`}>{movie.status}</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => navigate(`/watch/${type}/${id}`)}
                className="flex items-center gap-2 btn-netflix text-base px-8 py-3 rounded"
              >
                <FiPlay fill="currentColor" size={18} /> Play
              </button>
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 btn-secondary text-base px-6 py-3 rounded"
                >
                  ▶ Watch Trailer
                </button>
              )}
              <button
                onClick={() => toggle(movie, type)}
                className={`flex items-center gap-2 border text-sm px-5 py-3 rounded font-medium transition-all ${
                  inList
                    ? 'border-white text-white bg-white/10'
                    : 'border-gray-500 text-gray-300 hover:border-white hover:text-white'
                }`}
              >
                {inList ? <><FiCheck size={16} /> In My List</> : <><FiPlus size={16} /> My List</>}
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-800 mb-6">
              <div className="flex gap-0">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-sm font-medium capitalize transition-all border-b-2 ${
                      activeTab === tab
                        ? 'border-netflix-red text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                <p className="text-gray-300 leading-relaxed text-base max-w-2xl mb-6">
                  {movie.overview || 'No description available.'}
                </p>

                {/* Extra info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {movie.budget > 0 && (
                    <div>
                      <span className="text-gray-500">Budget</span>
                      <p className="text-white font-medium">${(movie.budget / 1e6).toFixed(1)}M</p>
                    </div>
                  )}
                  {movie.revenue > 0 && (
                    <div>
                      <span className="text-gray-500">Revenue</span>
                      <p className="text-white font-medium">${(movie.revenue / 1e6).toFixed(1)}M</p>
                    </div>
                  )}
                  {movie.vote_count && (
                    <div>
                      <span className="text-gray-500">Votes</span>
                      <p className="text-white font-medium">{movie.vote_count.toLocaleString()}</p>
                    </div>
                  )}
                  {movie.number_of_seasons && (
                    <div>
                      <span className="text-gray-500">Seasons</span>
                      <p className="text-white font-medium">{movie.number_of_seasons}</p>
                    </div>
                  )}
                  {movie.number_of_episodes && (
                    <div>
                      <span className="text-gray-500">Episodes</span>
                      <p className="text-white font-medium">{movie.number_of_episodes}</p>
                    </div>
                  )}
                  {movie.production_companies?.slice(0, 1).map(c => (
                    <div key={c.id}>
                      <span className="text-gray-500">Studio</span>
                      <p className="text-white font-medium">{c.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'cast' && (
              <div className="animate-fade-in">
                {cast.length === 0 ? (
                  <p className="text-gray-500">No cast information available.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {cast.map(person => (
                      <div key={person.id} className="flex flex-col items-center text-center gap-2">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 ring-2 ring-gray-700">
                          {person.profile_path ? (
                            <img
                              src={getImageUrl(person.profile_path, 'w185')}
                              alt={person.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                          )}
                        </div>
                        <div>
                          <p className="text-white text-xs font-semibold leading-tight">{person.name}</p>
                          <p className="text-gray-500 text-xs mt-0.5 leading-tight">{person.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewsSection movieId={movie.id} mediaType={type} />
            )}

            {activeTab === 'similar' && (
              <div className="animate-fade-in -mx-4 md:-mx-16">
                {similar.length > 0 && (
                  <MovieRow title="Similar Titles" movies={similar} type={type} />
                )}
                {recommendations.length > 0 && (
                  <MovieRow title="Recommended For You" movies={recommendations} type={type} />
                )}
                {similar.length === 0 && recommendations.length === 0 && (
                  <p className="text-gray-500 px-4 md:px-16">No similar titles found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-netflix-black animate-pulse">
      <div className="w-full h-[60vh] skeleton" />
      <div className="px-4 md:px-16 -mt-32 relative z-10 pt-8 space-y-6">
        <div className="flex gap-8">
          <div className="hidden md:block w-52 aspect-[2/3] skeleton rounded-lg" />
          <div className="flex-1 space-y-4 pt-8">
            <div className="flex gap-2">
              {[1, 2, 3].map(i => <div key={i} className="h-6 w-20 skeleton rounded-full" />)}
            </div>
            <div className="h-12 w-3/4 skeleton rounded" />
            <div className="flex gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-5 w-20 skeleton rounded" />)}
            </div>
            <div className="flex gap-3">
              <div className="h-12 w-32 skeleton rounded" />
              <div className="h-12 w-40 skeleton rounded" />
              <div className="h-12 w-28 skeleton rounded" />
            </div>
            <div className="space-y-2 pt-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-4 skeleton rounded w-full" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
