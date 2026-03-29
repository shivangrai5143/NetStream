import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/firestore';
import toast from 'react-hot-toast';
import { FiTrash2, FiArrowLeft } from 'react-icons/fi';

const AVATAR_COLORS = {
  avatar1: 'from-blue-500 to-blue-700',
  avatar2: 'from-red-500 to-red-700',
  avatar3: 'from-green-500 to-green-700',
  avatar4: 'from-purple-500 to-purple-700',
  avatar5: 'from-yellow-500 to-orange-600',
};
const AVATAR_EMOJIS = { avatar1: '🦁', avatar2: '🐯', avatar3: '🐧', avatar4: '🦊', avatar5: '🐻' };
const AVATARS = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'];

export default function ProfilePage() {
  const { user, profiles, refreshProfiles } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [newProfile, setNewProfile] = useState({ name: '', avatar: 'avatar1', isKids: false });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProfile.name.trim()) { toast.error('Profile name required'); return; }
    if (!user) return;
    setLoading(true);
    try {
      await profileService.create(user.uid, newProfile);
      await refreshProfiles();
      toast.success('Profile created!');
      setShowForm(false);
      setNewProfile({ name: '', avatar: 'avatar1', isKids: false });
    } catch (err) {
      toast.error('Failed to create profile');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this profile?')) return;
    if (!user) return;
    try {
      await profileService.delete(user.uid, id);
      await refreshProfiles();
      toast.success('Profile deleted');
    } catch (err) {
      toast.error('Failed to delete profile');
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black px-4 md:px-16 py-16">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/profiles')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FiArrowLeft /> Back to profiles
        </button>

        <h1 className="text-white text-3xl font-bold mb-8">Manage Profiles</h1>

        {/* Existing profiles */}
        <div className="space-y-3 mb-8">
          {profiles.map(profile => (
            <div key={profile._id} className="flex items-center gap-4 bg-zinc-900 rounded-lg p-4">
              <div className={`w-12 h-12 rounded bg-gradient-to-br ${AVATAR_COLORS[profile.avatar]} flex items-center justify-center text-2xl flex-shrink-0`}>
                {AVATAR_EMOJIS[profile.avatar]}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{profile.name}</p>
                {profile.isKids && <span className="text-xs bg-blue-600 px-1.5 py-0.5 rounded text-white">KIDS</span>}
              </div>
              <button onClick={() => handleDelete(profile._id)} className="text-gray-500 hover:text-red-500 transition-colors p-2">
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Add new profile */}
        {profiles.length < 5 && (
          showForm ? (
            <form onSubmit={handleCreate} className="bg-zinc-900 rounded-lg p-6 space-y-4">
              <h2 className="text-white text-xl font-semibold">New Profile</h2>
              <input
                type="text"
                placeholder="Profile name"
                value={newProfile.name}
                onChange={e => setNewProfile(p => ({ ...p, name: e.target.value }))}
                className="input-netflix"
                maxLength={20}
              />
              <div>
                <p className="text-gray-400 text-sm mb-3">Choose avatar</p>
                <div className="flex gap-3">
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setNewProfile(p => ({ ...p, avatar: av }))}
                      className={`w-12 h-12 rounded bg-gradient-to-br ${AVATAR_COLORS[av]} flex items-center justify-center text-2xl transition-all ${newProfile.avatar === av ? 'ring-4 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                    >
                      {AVATAR_EMOJIS[av]}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={newProfile.isKids} onChange={e => setNewProfile(p => ({ ...p, isKids: e.target.checked }))} className="w-4 h-4 accent-netflix-red" />
                <span className="text-gray-300 text-sm">Kids profile (limited content)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-netflix px-8 disabled:opacity-60">
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-8">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowForm(true)} className="w-full border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg p-6 text-gray-400 hover:text-white transition-all text-center">
              + Add New Profile
            </button>
          )
        )}
      </div>
    </div>
  );
}
