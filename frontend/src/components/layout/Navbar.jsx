import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiSearch, FiBell, FiChevronDown, FiUser, FiList,
  FiLogOut, FiSettings
} from 'react-icons/fi';

const AVATAR_COLORS = {
  avatar1: 'from-blue-500 to-blue-700',
  avatar2: 'from-red-500 to-red-700',
  avatar3: 'from-green-500 to-green-700',
  avatar4: 'from-purple-500 to-purple-700',
  avatar5: 'from-yellow-500 to-orange-600',
};

export default function Navbar() {
  const { user, activeProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowProfileMenu(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'TV Shows', path: '/search?type=tv' },
    { label: 'Movies', path: '/search?type=movie' },
    { label: 'My List', path: '/my-list' },
  ];

  const avatarGradient = AVATAR_COLORS[activeProfile?.avatar] || 'from-blue-500 to-blue-700';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-netflix-black shadow-2xl' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="flex items-center justify-between px-4 md:px-12 py-3">
        {/* Logo + Nav Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-netflix-red font-black text-2xl md:text-3xl tracking-tighter uppercase italic">NetStream</h1>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-5">
            {navLinks.map(link => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    location.pathname === link.path ? 'text-white font-bold' : 'text-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div ref={searchRef} className="relative flex items-center">
            {showSearch ? (
              <form onSubmit={handleSearch} className="flex items-center border border-white bg-black/80 backdrop-blur-sm rounded">
                <FiSearch className="ml-3 text-white flex-shrink-0" size={16} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Titles, people, genres"
                  className="bg-transparent text-white text-sm px-3 py-2 w-52 outline-none placeholder-gray-400"
                />
              </form>
            ) : (
              <button onClick={() => setShowSearch(true)} className="text-white hover:text-gray-300 transition-colors">
                <FiSearch size={20} />
              </button>
            )}
          </div>

          {/* Bell */}
          <button className="text-white hover:text-gray-300 transition-colors hidden md:block">
            <FiBell size={20} />
          </button>

          {/* Profile Menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 group"
            >
              <div className={`w-8 h-8 rounded bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {activeProfile?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <FiChevronDown
                size={14}
                className={`text-white transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-black/95 border border-gray-700 rounded shadow-2xl py-2 animate-scale-in">
                {/* Profile info */}
                <div className="px-4 py-2 border-b border-gray-700 mb-1">
                  <p className="text-white text-sm font-medium">{activeProfile?.name || 'Profile'}</p>
                  <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                </div>

                <Link
                  to="/profiles"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm"
                >
                  <FiUser size={15} /> Switch Profile
                </Link>
                <Link
                  to="/my-list"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm"
                >
                  <FiList size={15} /> My List
                </Link>
                <Link
                  to="/profile/manage"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm"
                >
                  <FiSettings size={15} /> Manage Profiles
                </Link>
                <div className="border-t border-gray-700 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm w-full text-left"
                  >
                    <FiLogOut size={15} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
