import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiEdit2 } from 'react-icons/fi';

const AVATAR_COLORS = {
  avatar1: 'from-blue-500 to-blue-700',
  avatar2: 'from-red-500 to-red-700',
  avatar3: 'from-green-500 to-green-700',
  avatar4: 'from-purple-500 to-purple-700',
  avatar5: 'from-yellow-500 to-orange-600',
};

const AVATAR_EMOJIS = {
  avatar1: '🦁', avatar2: '🐯', avatar3: '🐧', avatar4: '🦊', avatar5: '🐻'
};

export default function ProfileSelectPage() {
  const { profiles, selectProfile, user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const handleSelectProfile = (profile) => {
    if (isEditing) {
      navigate('/profile/manage');
      return;
    }
    selectProfile(profile);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-netflix-black flex flex-col items-center justify-center px-4">
      <h1 className="text-white text-4xl md:text-5xl font-medium mb-10">
        {isEditing ? 'Manage Profiles' : "Who's watching?"}
      </h1>

      <div className="flex flex-wrap justify-center gap-6 mb-12">
        {profiles.map((profile) => (
          <button
            key={profile._id}
            onClick={() => handleSelectProfile(profile)}
            className="group flex flex-col items-center gap-3"
          >
            <div className={`relative w-28 h-28 md:w-32 md:h-32 rounded-md bg-gradient-to-br ${AVATAR_COLORS[profile.avatar] || 'from-blue-500 to-blue-700'} flex items-center justify-center text-5xl transition-all duration-200 ${isEditing ? 'opacity-80' : 'group-hover:ring-4 ring-white'}`}>
              {AVATAR_EMOJIS[profile.avatar] || '👤'}
              {isEditing && (
                <div className="absolute inset-0 bg-black/60 rounded-md flex items-center justify-center">
                  <FiEdit2 className="text-white" size={28} />
                </div>
              )}
            </div>
            <span className={`text-sm font-medium transition-colors ${isEditing ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
              {profile.name}
              {profile.isKids && <span className="ml-1 text-xs bg-blue-600 px-1 py-0.5 rounded text-white">KIDS</span>}
            </span>
          </button>
        ))}

        {/* Add profile */}
        {profiles.length < 5 && (
          <button
            onClick={() => navigate('/profile/manage')}
            className="group flex flex-col items-center gap-3"
          >
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-md bg-zinc-800 border-2 border-zinc-600 group-hover:border-white flex items-center justify-center transition-all duration-200">
              <FiPlus className="text-zinc-400 group-hover:text-white transition-colors" size={40} />
            </div>
            <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
              Add Profile
            </span>
          </button>
        )}
      </div>

      <button
        onClick={() => setIsEditing(!isEditing)}
        className="border border-gray-500 text-gray-400 hover:text-white hover:border-white px-8 py-2 text-sm font-medium tracking-widest uppercase transition-colors"
      >
        {isEditing ? 'Done' : 'Manage Profiles'}
      </button>

      <p className="mt-6 text-gray-500 text-sm">Signed in as {user?.email}</p>
    </div>
  );
}
