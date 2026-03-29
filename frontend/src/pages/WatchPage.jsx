import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieAPI } from '../services/tmdb';
import { historyService } from '../services/firestore';
import { useAuth } from '../context/AuthContext';
import {
  FiArrowLeft, FiPlay, FiPause, FiVolume2, FiVolumeX,
  FiMaximize, FiMinimize, FiSettings
} from 'react-icons/fi';

const SAMPLE_VIDEO = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function WatchPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { activeProfile, user } = useAuth();

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const progressSaveRef = useRef(null);

  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [useTrailer, setUseTrailer] = useState(false);
  const [videoSrc, setVideoSrc] = useState(SAMPLE_VIDEO);

  // Player state
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCT] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Fetch movie info and history
  useEffect(() => {
    const fetch = type === 'movie' ? movieAPI.getMovieDetails : movieAPI.getTVDetails;
    fetch(id).then(({ data }) => {
      setMovie(data);
      const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer) setTrailerKey(trailer.key);
      
      // Try to load progress
      if (user && activeProfile) {
        historyService.get(user.uid, activeProfile._id).then(items => {
          const past = items.find(i => String(i.movieId) === String(id));
          if (past && past.progress > 0 && past.progress < 100 && videoRef.current && past.duration) {
            videoRef.current.currentTime = (past.progress / 100) * past.duration;
          }
        });
      }
    }).catch(console.error);
  }, [id, type, user, activeProfile]);

  // Auto-hide controls
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    showControlsTemporarily();
    return () => clearTimeout(controlsTimerRef.current);
  }, [playing]);

  // Save watch progress
  useEffect(() => {
    if (!movie || !activeProfile || !user) return;
    progressSaveRef.current = setInterval(async () => {
      if (!videoRef.current || !playing) return;
      const pct = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
      try {
        await historyService.add(user.uid, activeProfile._id, {
          movieId: movie.id,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          overview: movie.overview,
          vote_average: movie.vote_average,
          release_date: movie.release_date || movie.first_air_date,
          media_type: type,
          progress: pct,
          duration: Math.round(duration),
        });
      } catch {}
    }, 15000); // Save every 15s for better precision
    return () => clearInterval(progressSaveRef.current);
  }, [movie, activeProfile, user, playing, currentTime, duration, type]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': skip(10); break;
        case 'ArrowLeft': skip(-10); break;
        case 'm': toggleMute(); break;
        case 'f': toggleFullscreen(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const skip = (secs) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + secs));
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCT(v.currentTime);
    setProgress(v.duration > 0 ? (v.currentTime / v.duration) * 100 : 0);
    // Buffered
    if (v.buffered.length > 0) {
      setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
    }
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  const handleVolumeChange = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    setVolume(val);
    setMuted(val === 0);
    v.muted = val === 0;
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!document.fullscreenElement) {
      await el?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return h > 0 ? `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}` : `${m}:${s.toString().padStart(2,'0')}`;
  };

  const title = movie?.title || movie?.name || 'Loading...';

  if (useTrailer && trailerKey) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
          <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300 transition-colors">
            <FiArrowLeft size={24} />
          </button>
          <div>
            <p className="text-white font-bold text-lg">{title}</p>
            <p className="text-gray-400 text-sm">Trailer</p>
          </div>
        </div>
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1&rel=0`}
          allow="autoplay; fullscreen"
          allowFullScreen
          title="Trailer"
        />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => setUseTrailer(false)}
            className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-2 rounded-full text-sm hover:bg-white/30 transition-colors"
          >
            Switch to Demo Player
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex flex-col select-none"
      onMouseMove={showControlsTemporarily}
      onTouchStart={showControlsTemporarily}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onClick={togglePlay}
      />

      {/* Controls overlay */}
      <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Top bar */}
        <div className="flex items-center gap-4 px-4 md:px-8 py-4 bg-gradient-to-b from-black/80 to-transparent">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <p className="text-white font-bold text-lg leading-tight">{title}</p>
            <p className="text-gray-400 text-sm capitalize">{type} • Demo Player</p>
          </div>
          {trailerKey && (
            <button
              onClick={() => setUseTrailer(true)}
              className="ml-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs px-4 py-1.5 rounded-full transition-colors backdrop-blur-sm"
            >
              Watch Trailer
            </button>
          )}
        </div>

        {/* Center play area */}
        <div className="flex-1 flex items-center justify-center gap-8" onClick={togglePlay}>
          <button
            onClick={(e) => { e.stopPropagation(); skip(-10); }}
            className="text-white text-2xl font-bold bg-white/10 rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/20 transition-colors"
            title="Rewind 10s"
          >−10</button>
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="text-black bg-white rounded-full w-16 h-16 flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
          >
            {playing ? <FiPause size={28} fill="currentColor" /> : <FiPlay size={28} fill="currentColor" style={{ marginLeft: 3 }} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); skip(10); }}
            className="text-white text-2xl font-bold bg-white/10 rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/20 transition-colors"
            title="Forward 10s"
          >+10</button>
        </div>

        {/* Bottom bar */}
        <div className="px-4 md:px-8 pb-6 bg-gradient-to-t from-black/90 to-transparent">
          {/* Progress bar */}
          <div className="relative h-1 bg-white/30 rounded-full mb-4 cursor-pointer group/progress"
            onClick={handleSeek}
          >
            {/* Buffered */}
            <div
              className="absolute h-full bg-white/40 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            {/* Played */}
            <div
              className="absolute h-full bg-netflix-red rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-gray-300 transition-colors">
              {playing ? <FiPause size={22} fill="currentColor" /> : <FiPlay size={22} fill="currentColor" />}
            </button>

            {/* Skip */}
            <button onClick={() => skip(10)} className="text-white hover:text-gray-300 text-xs font-bold transition-colors hidden sm:block">
              +10
            </button>

            {/* Volume */}
            <div
              className="flex items-center gap-2 relative"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button onClick={toggleMute} className="text-white hover:text-gray-300 transition-colors">
                {muted || volume === 0 ? <FiVolumeX size={22} /> : <FiVolume2 size={22} />}
              </button>
              {showVolumeSlider && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 accent-netflix-red cursor-pointer"
                />
              )}
            </div>

            {/* Time */}
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition-colors">
              {fullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Note about demo player */}
      {showControls && (
        <div className="absolute top-20 right-6 bg-black/60 text-yellow-300 text-xs px-3 py-1.5 rounded-full backdrop-blur-sm border border-yellow-500/30">
          📽 Demo video — real streaming requires licensed content
        </div>
      )}
    </div>
  );
}
