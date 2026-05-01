import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCheck, Loader, Info, Package, Leaf, Star, UserCheck } from 'lucide-react';
import { fetchAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const getIcon = (text: string) => {
  if (text?.toLowerCase().includes('donation') || text?.toLowerCase().includes('pickup')) return Package;
  if (text?.toLowerCase().includes('tree') || text?.toLowerCase().includes('environment')) return Leaf;
  if (text?.toLowerCase().includes('thank') || text?.toLowerCase().includes('impact')) return Star;
  if (text?.toLowerCase().includes('volunteer') || text?.toLowerCase().includes('application')) return UserCheck;
  return Info;
};

export default function Notifications() {
  const { dark, notifications, markRead, setNotifications } = useApp();
  const [markingAll, setMarkingAll] = useState(false);
  const navigate = useNavigate();

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  const handleNotificationClick = (n: any) => {
    if (!n.read) {
      markRead(n.id);
    }
    const text = (n.text || n.title || n.message || "").toLowerCase();
    
    if (text.includes('donation') || text.includes('pickup')) {
      navigate('/dashboard');
    } else if (text.includes('volunteer')) {
      navigate('/volunteer');
    } else if (text.includes('message')) {
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      // Mark all unread ones via PATCH
      await Promise.all(
        unread.map(n =>
          fetchAPI(`/api/chat/notifications/${n.id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ read: true })
          }).catch(() => {})
        )
      );
      if ((window as any).refreshAppData) (window as any).refreshAppData();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className={`min-h-screen pt-24 pb-16 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold font-serif ${dark ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h1>
            <p className={`mt-1 text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              {unread.length > 0 ? `${unread.length} unread notification${unread.length > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unread.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                dark ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200'
              } disabled:opacity-50`}
            >
              {markingAll ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
              Mark all read
            </button>
          )}
        </div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className={`rounded-3xl p-16 text-center ${dark ? 'bg-slate-800' : 'bg-white shadow-sm border border-gray-100'}`}>
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>No Notifications Yet</h3>
            <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              You'll see updates here about your donations, pickups, and volunteer activities.
            </p>
          </div>
        )}

        {/* Unread Section */}
        {unread.length > 0 && (
          <div className="mb-6">
            <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              New · {unread.length}
            </h2>
            <div className="space-y-3">
              {unread.map(n => {
                const Icon = getIcon(n.text);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all border-l-4 border-primary-500 ${
                      dark ? 'bg-primary-900/20 hover:bg-primary-900/30' : 'bg-primary-50/70 hover:bg-primary-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-primary-500/20">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-snug ${dark ? 'text-gray-100' : 'text-gray-800'}`}>{n.text}</p>
                      <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{n.time}</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Read Section */}
        {read.length > 0 && (
          <div>
            <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              Earlier · {read.length}
            </h2>
            <div className={`rounded-3xl overflow-hidden ${dark ? 'bg-slate-800' : 'bg-white shadow-sm border border-gray-100'}`}>
              {read.map((n, i) => {
                const Icon = getIcon(n.text);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-4 p-4 cursor-pointer transition-colors ${
                      i < read.length - 1 ? (dark ? 'border-b border-slate-700' : 'border-b border-gray-50') : ''
                    } ${dark ? 'hover:bg-slate-700/40' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                      <Icon className={`w-5 h-5 ${dark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{n.text}</p>
                      <p className={`text-xs mt-1 ${dark ? 'text-gray-600' : 'text-gray-400'}`}>{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
