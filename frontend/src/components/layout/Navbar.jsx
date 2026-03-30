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
            <svg className="h-7 md:h-8 fill-netflix-red" viewBox="0 0 111 30" focusable="false">
              <path d="M105.06 22.23l-3.3-11.09a14.44 14.44 0 01-.37-1.57c-.1-.51-.17-.9-.2-1.17h-.08c-.03.27-.1.67-.2 1.19-.1.52-.23 1.03-.38 1.55L97.23 22.23h-3.57l-4.16-16.46h3.24l2.2 9.72c.14.62.26 1.22.36 1.81.1.59.18 1.15.24 1.68h.08c.06-.53.15-1.1.28-1.7.13-.6.27-1.2.43-1.79l2.57-9.72h3.24l2.5 9.72c.15.59.29 1.19.43 1.79.13.6.23 1.17.28 1.7h.09c.06-.53.14-1.09.24-1.68.1-.59.22-1.19.36-1.81l2.2-9.72H111l-4.17 16.46h-1.77zM88.63 22.23V5.77h3.12v16.46h-3.12zM84.23 22.23l-6.5-10.5c-.25-.41-.48-.83-.68-1.24-.2-.41-.37-.8-.5-1.17h-.09c.04.44.07.9.09 1.38.02.48.03.97.03 1.46v10.07H73.7V5.77h3.26l6.26 10.14c.25.41.48.82.68 1.22.2.4.37.79.5 1.17h.09c-.04-.44-.07-.9-.09-1.4-.02-.5-.03-1-.03-1.5V5.77h2.86v16.46h-3.0zM70.2 22.23V5.77h9.1v2.65H73.3v4.08h5.63v2.59H73.3v4.5h6.25v2.64H70.2zM61.19 22.23v-13.8h-4.18V5.77h11.49v2.66H64.3v13.8h-3.11zM52.65 22.23l-2.18-5.53h-1.26v5.53h-3.12V5.77h5.12c.88 0 1.67.14 2.37.43.7.29 1.3.7 1.78 1.23.48.53.84 1.16 1.09 1.88.24.72.36 1.5.36 2.33 0 1.22-.28 2.29-.84 3.2-.56.91-1.35 1.57-2.37 1.97l2.6 6.42h-3.55zm-3.44-8.1h1.7c.37 0 .72-.07 1.05-.2.33-.13.62-.33.86-.59.25-.26.44-.58.58-.96.14-.38.21-.82.21-1.31 0-.45-.07-.86-.2-1.21a2.36 2.36 0 00-.56-.87 2.3 2.3 0 00-.86-.53 3.3 3.3 0 00-1.1-.18h-1.68v5.85zM38.62 22.23V5.77h3.12v16.46h-3.12zM28.54 22.23V5.77h3.11v13.8h5.9v2.66h-9.01zM5.8 0L0 15.46v14.54h3.03V15.97L9.36 0H5.8zm8.84 0l-6.23 15.97V30h3.02V15.46L17.8 0h-3.16zm5.91 0L14.38 15.97V30h3.03V15.46L23.7 0h-3.15z"/>
            </svg>
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
