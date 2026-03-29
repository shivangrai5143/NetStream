import { useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MovieCard from './MovieCard';
import SkeletonCard from '../common/SkeletonCard';

export default function MovieRow({ title, movies = [], loading = false, type = 'movie' }) {
  const rowRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 10);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const skeletons = Array(8).fill(null);

  return (
    <div className="row-container">
      <h2 className="section-title">{title}</h2>
      <div className="relative group">
        {/* Left arrow */}
        {showLeft && !loading && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FiChevronLeft size={28} />
          </button>
        )}

        {/* Right arrow */}
        {showRight && !loading && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FiChevronRight size={28} />
          </button>
        )}

        {/* Scroll container */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-4 md:px-12 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? skeletons.map((_, i) => <SkeletonCard key={i} />)
            : movies.map((movie) => (
                <MovieCard key={`${movie.id}-${title}`} movie={movie} type={type} />
              ))
          }
        </div>
      </div>
    </div>
  );
}
