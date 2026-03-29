import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiPlus, FiCheck, FiInfo, FiStar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { watchlistAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtils';



export default function MovieCard({ movie, type = 'movie' }) {
  const navigate = useNavigate();
  const { activeProfile, user } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [inList, setInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const id = movie.id;
  const title = movie.title || movie.name;
  const poster = movie.poster_path ? getImageUrl(movie.poster_path, 'w500') : null;
  const backdrop = movie.backdrop_path ? getImageUrl(movie.backdrop_path, 'w780') : poster;
  const rating = movie.vote_average?.toFixed(1);
  const mediaType = movie.media_type || type;
  const year = (movie.release_date || movie.first_air_date)?.slice(0, 4);

  const handlePlay = (e) => {
    e.stopPropagation();
    navigate(`/watch/${mediaType}/${id}`);
  };

  const handleInfo = (e) => {
    e.stopPropagation();
    navigate(`/${mediaType}/${id}`);
  };

  const handleWatchlist = async (e) => {
    e.stopPropagation();
    if (!activeProfile) return toast.error('Please select a profile');
    setListLoading(true);
    try {
      if (inList) {
        await watchlistAPI.remove(id, activeProfile._id);
        setInList(false);
        toast.success('Removed from My List');
      } else {
        await watchlistAPI.add({
          profileId: activeProfile._id,
          movieId: id,
          title,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          overview: movie.overview,
          vote_average: movie.vote_average,
          release_date: movie.release_date || movie.first_air_date,
          media_type: mediaType,
          genre_ids: movie.genre_ids || [],
        });
        setInList(true);
        toast.success('Added to My List');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setListLoading(false);
    }
  };

  return (
    <div
      className="relative flex-shrink-0 cursor-pointer group"
      style={{ width: '180px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/${mediaType}/${id}`)}
    >
      {/* Poster */}
      <div className="rounded overflow-hidden bg-gray-900 aspect-[2/3] transition-transform duration-300 group-hover:scale-105 group-hover:z-10 relative">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-xs text-center p-2">
            {title}
          </div>
        )}

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/60 flex flex-col justify-end p-2 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-white text-xs font-semibold truncate mb-1">{title}</p>
          <div className="flex items-center gap-1 mb-2">
            {rating && (
              <span className="flex items-center gap-0.5 text-yellow-400 text-xs">
                <FiStar size={10} fill="currentColor" /> {rating}
              </span>
            )}
            {year && <span className="text-gray-400 text-xs">{year}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePlay}
              className="bg-white text-black rounded-full p-1.5 hover:bg-gray-200 transition-colors"
              title="Play"
            >
              <FiPlay size={12} fill="currentColor" />
            </button>
            <button
              onClick={handleWatchlist}
              disabled={listLoading}
              className="border border-gray-400 text-white rounded-full p-1.5 hover:border-white transition-colors"
              title={inList ? 'Remove from list' : 'Add to list'}
            >
              {inList ? <FiCheck size={12} /> : <FiPlus size={12} />}
            </button>
            <button
              onClick={handleInfo}
              className="border border-gray-400 text-white rounded-full p-1.5 hover:border-white transition-colors ml-auto"
              title="More info"
            >
              <FiInfo size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
