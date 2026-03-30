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
      toast.success('Account created! Welcome to Netflix.');
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
      className="min-h-screen bg-netflix-black flex items-center justify-center relative"
      style={{
        backgroundImage: 'url(https://assets.nflxext.com/ffe/siteui/vlv3/9db4f11a-1c9b-4f8c-b66e-1dbff54e9856/web/IN-en-20250317-TRIFECTA-perspective_1bd8d13d-cb16-4c86-b029-9f2cdfadd9fa_large.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="absolute top-6 left-8 md:left-16">
        <Link to="/">
          <svg className="h-8 fill-netflix-red" viewBox="0 0 111 30">
            <path d="M105.06 22.23l-3.3-11.09a14.44 14.44 0 01-.37-1.57c-.1-.51-.17-.9-.2-1.17h-.08c-.03.27-.1.67-.2 1.19-.1.52-.23 1.03-.38 1.55L97.23 22.23h-3.57l-4.16-16.46h3.24l2.2 9.72c.14.62.26 1.22.36 1.81.1.59.18 1.15.24 1.68h.08c.06-.53.15-1.1.28-1.7.13-.6.27-1.2.43-1.79l2.57-9.72h3.24l2.5 9.72c.15.59.29 1.19.43 1.79.13.6.23 1.17.28 1.7h.09c.06-.53.14-1.09.24-1.68.1-.59.22-1.19.36-1.81l2.2-9.72H111l-4.17 16.46h-1.77zM88.63 22.23V5.77h3.12v16.46h-3.12zM84.23 22.23l-6.5-10.5c-.25-.41-.48-.83-.68-1.24-.2-.41-.37-.8-.5-1.17h-.09c.04.44.07.9.09 1.38.02.48.03.97.03 1.46v10.07H73.7V5.77h3.26l6.26 10.14c.25.41.48.82.68 1.22.2.4.37.79.5 1.17h.09c-.04-.44-.07-.9-.09-1.4-.02-.5-.03-1-.03-1.5V5.77h2.86v16.46h-3.0zM70.2 22.23V5.77h9.1v2.65H73.3v4.08h5.63v2.59H73.3v4.5h6.25v2.64H70.2zM61.19 22.23v-13.8h-4.18V5.77h11.49v2.66H64.3v13.8h-3.11zM52.65 22.23l-2.18-5.53h-1.26v5.53h-3.12V5.77h5.12c.88 0 1.67.14 2.37.43.7.29 1.3.7 1.78 1.23.48.53.84 1.16 1.09 1.88.24.72.36 1.5.36 2.33 0 1.22-.28 2.29-.84 3.2-.56.91-1.35 1.57-2.37 1.97l2.6 6.42h-3.55zm-3.44-8.1h1.7c.37 0 .72-.07 1.05-.2.33-.13.62-.33.86-.59.25-.26.44-.58.58-.96.14-.38.21-.82.21-1.31 0-.45-.07-.86-.2-1.21a2.36 2.36 0 00-.56-.87 2.3 2.3 0 00-.86-.53 3.3 3.3 0 00-1.1-.18h-1.68v5.85zM38.62 22.23V5.77h3.12v16.46h-3.12zM28.54 22.23V5.77h3.11v13.8h5.9v2.66h-9.01zM5.8 0L0 15.46v14.54h3.03V15.97L9.36 0H5.8zm8.84 0l-6.23 15.97V30h3.02V15.46L17.8 0h-3.16zm5.91 0L14.38 15.97V30h3.03V15.46L23.7 0h-3.15z"/>
          </svg>
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
