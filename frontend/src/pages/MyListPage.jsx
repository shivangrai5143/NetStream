import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';
import { historyService } from '../services/firestore';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiPlay, FiClock, FiBookmark } from 'react-icons/fi';
import toast from 'react-hot-toast';

const IMG_BASE = 'https://image.tmdb.org/t/p/w342';

function MovieCard({ item, onRemove, showProgress = false }) {
  const mediaType = item.media_type || 'movie';
  const poster = item.poster_path ? `${IMG_BASE}${item.poster_path}` : null;
  const year = item.release_date?.slice(0, 4);
  const rating = item.vote_average?.toFixed(1);

  return (
    <div className="group relative bg-zinc-900 rounded-lg overflow-hidden hover:ring-2 ring-white/20 transition-all duration-200">
      <Link to={`/${mediaType}/${item.movieId}`}>
        <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden">
          {poster ? (
            <img
              src={poster}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm text-center p-3">
              {item.title}
            </div>
          )}

          {/* Progress bar for continue watching */}
          {showProgress && item.progress > 0 && item.progress < 100 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
              <div
                className="h-full bg-netflix-red"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white text-black rounded-full p-3">
              <FiPlay size={20} fill="currentColor" />
            </div>
          </div>
        </div>
      </Link>

      <div className="p-3">
        <p className="text-white text-sm font-medium truncate">{item.title}</p>
        <div className="flex items-center gap-2 mt-1">
          {rating && <span className="text-yellow-400 text-xs">★ {rating}</span>}
          {year && <span className="text-gray-500 text-xs">{year}</span>}
          {showProgress && item.progress > 0 && (
            <span className="text-gray-500 text-xs ml-auto">{item.progress}%</span>
          )}
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(item.movieId)}
        className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-gray-300 hover:text-red-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
        title="Remove"
      >
        <FiTrash2 size={14} />
      </button>
    </div>
  );
}

export default function MyListPage() {
  const { activeProfile, user } = useAuth();
  const { watchlist, loading: wlLoading, toggle: removeFromWatchlist, refetch } = useWatchlist();
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('mylist');

  const profileId = activeProfile?._id;

  useEffect(() => {
    if (!profileId || !user) return;
    setHistLoading(true);
    historyService.get(user.uid, profileId)
      .then((items) => setHistory(items || []))
      .catch(console.error)
      .finally(() => setHistLoading(false));
  }, [profileId, user]);

  const handleRemoveWatchlist = async (movieId) => {
    const item = watchlist.find(w => w.movieId === movieId);
    if (item) await removeFromWatchlist({ id: movieId, ...item }, item.media_type);
    refetch();
  };

  const handleRemoveHistory = async (movieId) => {
    if (!profileId || !user) return;
    try {
      await historyService.remove(user.uid, profileId, movieId);
      setHistory(prev => prev.filter(i => String(i.movieId) !== String(movieId)));
      toast.success('Removed from history');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleClearHistory = async () => {
    if (!profileId || !user || !confirm('Clear all watch history?')) return;
    try {
      await historyService.clear(user.uid, profileId);
      setHistory([]);
      toast.success('History cleared');
    } catch {
      toast.error('Failed to clear history');
    }
  };

  // Continue watching = history with 0 < progress < 100
  const continueWatching = history.filter(h => h.progress > 0 && h.progress < 100);

  const tabs = [
    { key: 'mylist', label: 'My List', icon: <FiBookmark size={16} />, count: watchlist.length },
    { key: 'history', label: 'Watch History', icon: <FiClock size={16} />, count: history.length },
    { key: 'continue', label: 'Continue Watching', icon: <FiPlay size={16} />, count: continueWatching.length },
  ];

  return (
    <div className="min-h-screen bg-netflix-black pt-20 pb-16 px-4 md:px-12 animate-fade-in">
      <h1 className="text-white text-3xl font-bold mb-8">
        {activeProfile?.name ? `${activeProfile.name}'s ` : ''}Library
      </h1>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-zinc-800 mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-netflix-red text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-netflix-red text-white' : 'bg-zinc-700 text-gray-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* My List */}
      {activeTab === 'mylist' && (
        <div className="animate-fade-in">
          {wlLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array(8).fill(null).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  <div className="aspect-[2/3] skeleton" />
                  <div className="p-3 space-y-2">
                    <div className="h-3.5 skeleton rounded w-4/5" />
                    <div className="h-3 skeleton rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : watchlist.length === 0 ? (
            <EmptyState
              icon="📋"
              title="Your list is empty"
              description="Add movies and shows using the + button to watch later"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {watchlist.map(item => (
                <MovieCard key={item._id} item={item} onRemove={handleRemoveWatchlist} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="animate-fade-in">
          {history.length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                onClick={handleClearHistory}
                className="text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5"
              >
                <FiTrash2 size={14} /> Clear All History
              </button>
            </div>
          )}
          {histLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array(6).fill(null).map((_, i) => (
                <div key={i} className="rounded-lg aspect-[2/3] skeleton" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <EmptyState
              icon="🕐"
              title="No watch history"
              description="Movies and shows you watch will appear here"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {history.map(item => (
                <MovieCard key={item._id} item={item} onRemove={handleRemoveHistory} showProgress />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Continue Watching */}
      {activeTab === 'continue' && (
        <div className="animate-fade-in">
          {continueWatching.length === 0 ? (
            <EmptyState
              icon="▶️"
              title="Nothing in progress"
              description="Start watching something and it will appear here"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {continueWatching.map(item => (
                <MovieCard key={item._id} item={item} onRemove={handleRemoveHistory} showProgress />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl mb-5">{icon}</p>
      <p className="text-white text-xl font-semibold mb-2">{title}</p>
      <p className="text-gray-500 text-sm max-w-xs">{description}</p>
    </div>
  );
}
