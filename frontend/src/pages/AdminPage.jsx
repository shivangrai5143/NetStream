import { useState, useEffect } from 'react';
import { adminService } from '../services/firestore';
import { movieAPI } from '../services/tmdb';
import { FiTrash2, FiSearch, FiCheck, FiUsers, FiFilm } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('featured');
  const [featured, setFeatured] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'featured') {
        const items = await adminService.getFeatured();
        setFeatured(items);
      } else if (activeTab === 'users') {
        const accounts = await adminService.getUsers();
        setUsers(accounts);
      }
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const res = await movieAPI.search({ q: searchTerm });
      setSearchResults(res.data.results.filter(m => m.media_type !== 'person'));
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleAddFeatured = async (movie) => {
    // Check if already featured
    if (featured.some(f => String(f.movieId) === String(movie.id))) {
      toast.error('Already featured');
      return;
    }
    try {
      const doc = await adminService.addFeatured({
        movieId: movie.id,
        title: movie.title || movie.name,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        media_type: movie.media_type || 'movie',
      });
      setFeatured([doc, ...featured]);
      toast.success('Added to Featured Staff Picks');
    } catch (err) {
      toast.error('Failed to add');
    }
  };

  const handleRemoveFeatured = async (id) => {
    try {
      await adminService.removeFeatured(id);
      setFeatured(prev => prev.filter(f => f.id !== id));
      toast.success('Removed from Featured');
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black pt-24 px-4 md:px-16 animate-fade-in text-white pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 mb-8 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-6 py-4 font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'featured' ? 'border-b-2 border-netflix-red text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FiFilm /> Staff Picks (Featured)
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-4 font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'users' ? 'border-b-2 border-netflix-red text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FiUsers /> Registered Users
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-zinc-800 border-t-netflix-red rounded-full animate-spin"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'featured' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Search & Add */}
                <div>
                  <h2 className="text-xl font-medium mb-4">Add Movie/Show to Featured</h2>
                  <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search TMDB..."
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-gray-400"
                    />
                    <button type="submit" disabled={searching} className="btn-netflix px-6">
                      <FiSearch />
                    </button>
                  </form>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {searchResults.map(movie => {
                      const isFeatured = featured.some(f => String(f.movieId) === String(movie.id));
                      return (
                        <div key={movie.id} className="flex gap-4 p-3 bg-zinc-900 rounded items-center border border-zinc-800">
                          {movie.poster_path ? (
                            <img src={getImageUrl(movie.poster_path, 'w92')} className="w-12 h-18 object-cover rounded" alt="" />
                          ) : (
                            <div className="w-12 h-18 bg-zinc-800 rounded flex items-center justify-center text-xs text-center p-1 text-gray-500">No Img</div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium line-clamp-1">{movie.title || movie.name}</h3>
                            <p className="text-xs text-gray-400 uppercase">{movie.media_type}</p>
                          </div>
                          <button
                            onClick={() => handleAddFeatured(movie)}
                            disabled={isFeatured}
                            className={`p-2 rounded-full ${isFeatured ? 'bg-green-600/20 text-green-500' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                          >
                            {isFeatured ? <FiCheck /> : <span className="text-xl font-bold leading-none">+</span>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Current Featured List */}
                <div>
                  <h2 className="text-xl font-medium mb-4 flex items-center justify-between">
                    Current Staff Picks
                    <span className="text-sm bg-zinc-800 px-3 py-1 rounded-full text-gray-300">{featured.length}</span>
                  </h2>
                  <div className="space-y-3">
                    {featured.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 bg-zinc-900/50 rounded border border-zinc-800 border-dashed">
                        No staff picks active. Add some movies!
                      </div>
                    ) : (
                      featured.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded border border-zinc-800 group hover:border-gray-600 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center font-bold text-gray-400">
                              {item.title?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{item.title}</p>
                              <p className="text-xs text-gray-500">Added {new Date(item.addedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFeatured(item.id)}
                            className="p-2 text-gray-500 hover:text-netflix-red hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                <table className="w-full text-left">
                  <thead className="bg-zinc-950 text-gray-400 text-sm border-b border-zinc-800">
                    <tr>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Role</th>
                      <th className="p-4 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {users.map(u => (
                      <tr key={u.uid} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {u.email?.charAt(0).toUpperCase()}
                          </div>
                          {u.email}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            u.role === 'admin' ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-300'
                          }`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 text-sm">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="3" className="p-8 text-center text-gray-500">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
