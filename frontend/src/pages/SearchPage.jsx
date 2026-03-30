import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSearch } from '../hooks/useMovies';
import { movieAPI } from '../services/api';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';

const IMG_BASE = 'https://image.tmdb.org/t/p/w342';
const PLACEHOLDER = 'https://via.placeholder.com/342x512/1a1a1a/666?text=No+Image';

const GENRES = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' }, { id: 14, name: 'Fantasy' }, { id: 27, name: 'Horror' },
  { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
];

function MovieGrid({ movies, loading, hasMore, onLoadMore }) {
  const loaderRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !loading) onLoadMore?.(); },
      { threshold: 0.1 }
    );
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (!loading && movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-6xl mb-4">🎬</p>
        <p className="text-white text-xl font-semibold mb-2">No results found</p>
        <p className="text-gray-500">Try a different search term or genre</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {movies.map((movie) => {
          const mediaType = movie.media_type || 'movie';
          const title = movie.title || movie.name;
          const poster = movie.poster_path ? `${IMG_BASE}${movie.poster_path}` : PLACEHOLDER;
          const rating = movie.vote_average?.toFixed(1);
          const year = (movie.release_date || movie.first_air_date)?.slice(0, 4);

          return (
            <Link
              key={`${movie.id}-${mediaType}`}
              to={`/${mediaType}/${movie.id}`}
              className="group block"
            >
              <div className="rounded-md overflow-hidden bg-gray-900 aspect-[2/3] relative">
                <img
                  src={poster}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
                  <p className="text-white text-xs font-semibold truncate leading-tight">{title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {rating && <span className="text-yellow-400 text-xs">★ {rating}</span>}
                    {year && <span className="text-gray-400 text-xs">{year}</span>}
                    <span className="text-gray-500 text-xs capitalize ml-auto">{mediaType}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-1.5 truncate group-hover:text-white transition-colors px-0.5">{title}</p>
            </Link>
          );
        })}

        {/* Skeleton placeholders while loading more */}
        {loading && Array(6).fill(null).map((_, i) => (
          <div key={`sk-${i}`} className="rounded-md overflow-hidden bg-gray-800 aspect-[2/3] skeleton" />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={loaderRef} className="h-8 mt-4" />
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'movie';

  const [query, setQuery] = useState(initialQuery);
  const [inputVal, setInputVal] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [mediaType, setMediaType] = useState(initialType);
  const [genreMovies, setGenreMovies] = useState([]);
  const [genrePage, setGenrePage] = useState(1);
  const [genreTotal, setGenreTotal] = useState(1);
  const [genreLoading, setGenreLoading] = useState(false);

  const { results: searchResults, loading: searchLoading } = useSearch(query);

  // Sync URL
  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (mediaType !== 'movie') params.type = mediaType;
    setSearchParams(params, { replace: true });
  }, [query, mediaType]);

  // Fetch genre movies
  const fetchGenreMovies = useCallback(async (genreId, page = 1, reset = false) => {
    setGenreLoading(true);
    try {
      const { data } = await movieAPI.discoverByGenre(genreId, mediaType, page);
      setGenreMovies(prev => reset ? (data.results || []) : [...prev, ...(data.results || [])]);
      setGenreTotal(data.total_pages || 1);
      setGenrePage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setGenreLoading(false);
    }
  }, [mediaType]);

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setQuery('');
    setInputVal('');
    setGenreMovies([]);
    setGenrePage(1);
    fetchGenreMovies(genre.id, 1, true);
  };

  const handleLoadMoreGenre = () => {
    if (genrePage < genreTotal && !genreLoading) {
      fetchGenreMovies(selectedGenre.id, genrePage + 1);
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    setQuery(inputVal.trim());
    setSelectedGenre(null);
  };

  const clearSearch = () => {
    setQuery('');
    setInputVal('');
    setSelectedGenre(null);
  };

  const showingQuery = !!query;
  const showingGenre = !!selectedGenre && !query;
  const showBrowse = !query && !selectedGenre;
  const displayMovies = showingQuery ? searchResults : genreMovies;
  const displayLoading = showingQuery ? searchLoading : genreLoading;
  const displayHasMore = showingGenre ? genrePage < genreTotal : false;

  return (
    <div className="min-h-screen bg-netflix-black pt-20 pb-16 px-4 md:px-12">
      {/* Search bar */}
      <div className="max-w-2xl mb-8">
        <form onSubmit={handleInputSubmit} className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-white transition-colors">
          <FiSearch className="text-gray-400 flex-shrink-0" size={20} />
          <input
            type="text"
            value={inputVal}
            onChange={e => { setInputVal(e.target.value); if (!e.target.value.trim()) clearSearch(); else setQuery(e.target.value.trim()); }}
            placeholder="Search for movies, shows, people..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-base"
            autoFocus
          />
          {(inputVal || selectedGenre) && (
            <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-white transition-colors">
              <FiX size={18} />
            </button>
          )}
        </form>

        {/* Media type toggle */}
        <div className="flex items-center gap-2 mt-3">
          {['movie', 'tv'].map(t => (
            <button
              key={t}
              onClick={() => { setMediaType(t); if (selectedGenre) fetchGenreMovies(selectedGenre.id, 1, true); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                mediaType === t ? 'bg-white text-black' : 'bg-zinc-800 text-gray-400 hover:text-white'
              }`}
            >
              {t === 'movie' ? '🎬 Movies' : '📺 TV Shows'}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {showingQuery && !searchLoading && (
        <p className="text-gray-400 text-sm mb-6">
          {searchResults.length === 0 ? 'No results' : `${searchResults.length} results`} for "{query}"
        </p>
      )}

      {/* Genre filter */}
      {!showingQuery && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-gray-400" size={16} />
            <h2 className="text-white font-semibold">Browse by Genre</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(g => (
              <button
                key={g.id}
                onClick={() => handleGenreSelect(g)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedGenre?.id === g.id
                    ? 'bg-netflix-red text-white'
                    : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section title */}
      {(showingQuery || showingGenre) && (
        <h2 className="text-white text-xl font-bold mb-5">
          {showingQuery ? `Search: "${query}"` : `${selectedGenre?.name} ${mediaType === 'tv' ? 'Shows' : 'Movies'}`}
        </h2>
      )}

      {/* Grid */}
      {(showingQuery || showingGenre) && (
        <MovieGrid
          movies={displayMovies}
          loading={displayLoading}
          hasMore={displayHasMore}
          onLoadMore={handleLoadMoreGenre}
        />
      )}

      {/* Browse state */}
      {showBrowse && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-7xl mb-4">🔍</p>
          <p className="text-white text-2xl font-bold mb-2">Find something great</p>
          <p className="text-gray-500 text-base">Search by title or browse by genre above</p>
        </div>
      )}
    </div>
  );
}
