import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Heart, Menu, X, Sun, Moon, Globe, Bell, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { dark, toggleDark, lang, setLang, t, isLoggedIn, logout, notifications, unreadMessagesCount } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const unread = notifications.filter(n => !n.read).length + unreadMessagesCount;

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/categories', label: t.nav.categories },
    { to: '/about', label: t.nav.about },
    { to: '/stories', label: t.nav.stories },
    { to: '/volunteer', label: t.nav.volunteer },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${dark ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-lg border-b ${dark ? 'border-slate-700' : 'border-gray-100'} shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
              Seva <span className="gradient-text">Marg</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : dark ? 'text-gray-300 hover:text-white hover:bg-slate-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className={`p-2 rounded-lg transition-colors ${dark ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`} title="Switch Language">
              <Globe className="w-4 h-4" />
              <span className="text-xs ml-1 font-medium">{lang === 'en' ? 'हि' : 'EN'}</span>
            </button>
            <button onClick={toggleDark} className={`p-2 rounded-lg transition-colors ${dark ? 'text-yellow-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}>
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isLoggedIn && (
              <Link to="/notifications" className={`p-2 rounded-lg transition-colors relative ${dark ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                )}
              </Link>
            )}

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard" className={`p-2 rounded-lg transition-colors ${dark ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <User className="w-4 h-4" />
                </Link>
                <button onClick={logout} className={`p-2 rounded-lg transition-colors ${dark ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${dark ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                {t.nav.login}
              </Link>
            )}

            <Link to="/donate" className="px-5 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5">
              {t.nav.donate}
            </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden p-2 rounded-lg ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={`lg:hidden border-t ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'} animate-fade-in`}>
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive(link.to) ? 'bg-primary-50 text-primary-700' : dark ? 'text-gray-300' : 'text-gray-600'}`}>
                {link.label}
              </Link>
            ))}
            {isLoggedIn && (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t.nav.dashboard}
              </Link>
            )}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
              <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                <Globe className="w-4 h-4" /> {lang === 'en' ? 'हिंदी' : 'English'}
              </button>
              <button onClick={toggleDark} className={`px-3 py-2 rounded-lg text-sm ${dark ? 'text-yellow-400' : 'text-gray-600'}`}>
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
            {!isLoggedIn && (
              <Link to="/auth" onClick={() => setMobileOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t.nav.login}
              </Link>
            )}
            <Link to="/donate" onClick={() => setMobileOpen(false)} className="block text-center px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-semibold mt-2">
              {t.nav.donate}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
