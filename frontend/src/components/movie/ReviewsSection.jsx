import { useState, useEffect } from 'react';
import { reviewService } from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';
import { FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ReviewsSection({ movieId, mediaType = 'movie' }) {
  const { user, activeProfile } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Use a combined key for reviews to separate movies and tv shows with same IDs
  const movieKey = `${mediaType}_${movieId}`;

  useEffect(() => {
    setLoading(true);
    reviewService.getForMovie(movieKey)
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [movieKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !activeProfile) {
      toast.error('Please sign in and select a profile to leave a review');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setSubmitting(true);
    try {
      const newReview = await reviewService.add(movieKey, {
        userId: user.uid,
        profileId: activeProfile._id,
        profileName: activeProfile.name || 'User',
        rating,
        text: text.trim(),
      });
      setReviews(prev => [newReview, ...prev]);
      setRating(0);
      setText('');
      toast.success('Review submitted!');
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="animate-fade-in bg-zinc-900/50 rounded-lg p-4 md:p-8">
      {/* Header & Stats */}
      <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Fan Reviews</h2>
          <p className="text-gray-400 text-sm">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>
        {averageRating && (
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-white">{averageRating}</span>
            <div className="flex flex-col">
              <span className="flex text-yellow-500">
                {[1,2,3,4,5].map(i => (
                  <FiStar key={i} size={14} fill={i <= Math.round(averageRating) ? "currentColor" : "none"} />
                ))}
              </span>
              <span className="text-gray-500 text-xs">Average</span>
            </div>
          </div>
        )}
      </div>

      {/* Review Form */}
      {user && activeProfile ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-zinc-900 p-6 rounded-lg border border-zinc-800">
          <h3 className="text-white font-medium mb-4">Write a review and rate</h3>
          
          {/* Star selector */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <FiStar
                  size={28}
                  className={`${
                    star <= (hoverRating || rating) ? 'text-yellow-500' : 'text-gray-600'
                  } transition-colors`}
                  fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                />
              </button>
            ))}
            <span className="ml-3 text-gray-400 text-sm">
              {rating > 0 && `${rating} out of 5 stars`}
            </span>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What did you think? (Optional)"
            className="w-full bg-zinc-800 border fill-netflix-red border-zinc-700 text-white rounded p-3 mb-4 focus:outline-none focus:border-gray-400 transition-colors placeholder-gray-500 resize-none h-24 text-sm"
          />
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="btn-netflix px-6 py-2 disabled:opacity-50 text-sm"
            >
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-4 bg-zinc-900/80 border border-zinc-800 rounded text-center">
          <p className="text-gray-400 text-sm">You must be signed in with an active profile to leave a review.</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          Array(3).fill(null).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-32 h-4 skeleton rounded" />
                <div className="w-24 h-3 skeleton rounded" />
                <div className="w-full h-16 skeleton rounded mt-2" />
              </div>
            </div>
          ))
        ) : reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.id} className="flex gap-4 p-4 rounded-lg hover:bg-zinc-800/30 transition-colors">
              <div className="w-10 h-10 rounded bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-bold flex-shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <span className="relative z-10">{review.profileName?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">{review.profileName}</span>
                  <span className="text-gray-500 text-xs">•</span>
                  <span className="flex text-yellow-500">
                    {[1,2,3,4,5].map(i => (
                      <FiStar key={i} size={10} fill={i <= review.rating ? "currentColor" : "none"} />
                    ))}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mb-2">
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </p>
                {review.text && (
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line bg-zinc-900/30 p-3 rounded border border-zinc-800">
                    {review.text}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">💬</p>
            <p>No reviews yet.</p>
            <p className="text-sm">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
