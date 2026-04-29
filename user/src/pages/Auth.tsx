import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Heart, Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Loader } from 'lucide-react';
import { fetchAPI } from '../utils/api';

export default function Auth() {
  const { dark, t, setIsLoggedIn, setUser } = useApp();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (!isLogin) {
        // Handle Signup
        await fetchAPI('/api/users/register/', {
          method: 'POST',
          body: JSON.stringify({
            username: form.email, // Using email as username
            email: form.email,
            password: form.password,
            first_name: form.name,
            phone_number: form.phone,
            city: form.city
          })
        });
      }

      // Handle Login (run automatically after successful signup or explicitly on login)
      const loginRes = await fetchAPI('/api/users/login/', {
        method: 'POST',
        body: JSON.stringify({
          username: form.email,
          password: form.password
        })
      });

      if (loginRes.access) {
        localStorage.setItem('access_token', loginRes.access);
        localStorage.setItem('refresh_token', loginRes.refresh);
        
        // Fetch user profile data
        const profile = await fetchAPI('/api/users/profile/');
        
        setUser({
          name: profile.first_name
            ? `${profile.first_name} ${profile.last_name || ''}`.trim()
            : profile.username || '',
          email: profile.email || '',
          phone: profile.phone_number || '',
          city: profile.city || '',
          role: profile.role || '',
        });
        
        setIsLoggedIn(true);
        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error("Auth failed:", err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const res = await fetchAPI('/api/users/auth/google/', { method: 'POST' });
      alert(res.message || "Google Auth requires backend GCP integration to complete.");
    } catch (err: any) {
      alert("Failed to reach Google Auth endpoint: " + err.message);
    }
  };

  return (
    <div className={`min-h-screen pt-20 pb-12 flex items-center justify-center px-4 ${dark ? 'bg-slate-900' : 'bg-gradient-to-br from-primary-50 via-white to-accent-50'}`}>
      <div className={`w-full max-w-md rounded-3xl p-8 animate-scale-in ${dark ? 'bg-slate-800 shadow-2xl shadow-slate-900/50' : 'bg-white shadow-2xl shadow-gray-200/50'}`}>
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className={`text-2xl font-bold font-serif ${dark ? 'text-white' : 'text-gray-900'}`}>
            {isLogin ? t.auth.login : t.auth.signup}
          </h1>
        </div>

        {/* Toggle Tabs */}
        <div className={`flex p-1 mb-6 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? (dark ? 'bg-slate-600 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (dark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
          >
            Log In
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? (dark ? 'bg-slate-600 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (dark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm font-medium rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <button onClick={handleGoogleAuth} type="button" className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 mb-6 font-medium transition-colors ${dark ? 'border-slate-600 text-gray-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className={`flex-1 h-px ${dark ? 'bg-slate-700' : 'bg-gray-200'}`} />
          <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>or</span>
          <div className={`flex-1 h-px ${dark ? 'bg-slate-700' : 'bg-gray-200'}`} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type="text" placeholder={t.auth.name} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 text-sm transition-colors ${dark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 focus:border-primary-500' : 'bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white'} outline-none`} />
            </div>
          )}
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input type="email" placeholder={t.auth.email} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required
              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 text-sm transition-colors ${dark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 focus:border-primary-500' : 'bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white'} outline-none`} />
          </div>
          {!isLogin && (
            <>
              <div className="relative">
                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input type="tel" placeholder={t.auth.phone} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 text-sm transition-colors ${dark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 focus:border-primary-500' : 'bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white'} outline-none`} />
              </div>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input type="text" placeholder={t.auth.city} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 text-sm transition-colors ${dark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 focus:border-primary-500' : 'bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white'} outline-none`} />
              </div>
            </>
          )}
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input type={showPass ? 'text' : 'password'} placeholder={t.auth.password} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required
              className={`w-full pl-10 pr-10 py-3 rounded-xl border-2 text-sm transition-colors ${dark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 focus:border-primary-500' : 'bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white'} outline-none`} />
            <button type="button" onClick={() => setShowPass(!showPass)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50">
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : (isLogin ? t.auth.loginBtn : t.auth.signupBtn)}
          </button>
        </form>

        {/* Removed redundant text at bottom since tabs now clearly control state */}
      </div>
    </div>
  );
}
