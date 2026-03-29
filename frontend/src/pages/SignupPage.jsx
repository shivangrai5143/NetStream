import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';

export default function SignupPage() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.username || form.username.length < 2) errs.username = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created! Welcome to NetStream.');
      navigate('/profiles');
    } catch (err) {
      toast.error(err.code?.replace('auth/', '').replace(/-/g, ' ') || 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/profiles');
    } catch (err) {
      toast.error('Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(errs => ({ ...errs, [e.target.name]: '' }));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative bg-netflix-black"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="absolute top-6 left-8 md:left-16">
        <Link to="/">
          <h1 className="text-netflix-red font-black text-3xl tracking-tighter uppercase italic">NetStream</h1>
        </Link>
      </div>

      <div className="relative z-10 bg-black/75 rounded-md p-8 md:p-14 w-full max-w-md mx-4">
        <h1 className="text-white text-3xl font-bold mb-8">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="username"
              type="text"
              placeholder="Your name"
              value={form.username}
              onChange={handleChange}
              className={`input-netflix ${errors.username ? 'border-orange-500' : ''}`}
            />
            {errors.username && <p className="text-orange-400 text-xs mt-1">{errors.username}</p>}
          </div>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              className={`input-netflix ${errors.email ? 'border-orange-500' : ''}`}
            />
            {errors.email && <p className="text-orange-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Add a password"
              value={form.password}
              onChange={handleChange}
              className={`input-netflix ${errors.password ? 'border-orange-500' : ''}`}
            />
            {errors.password && <p className="text-orange-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-netflix w-full py-4 text-base mt-6 disabled:opacity-60 disabled:cursor-not-allowed justify-center"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Creating account...
              </span>
            ) : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black font-medium py-3 rounded transition-colors disabled:opacity-60"
          >
            <FcGoogle size={24} /> Continue with Google
          </button>
        </div>

        <div className="mt-6 text-gray-400 text-sm">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-white font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
