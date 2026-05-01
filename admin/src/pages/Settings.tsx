import { useState, useEffect } from 'react';
import { Settings2, Plus, Trash2, Save, Bell, Shield, Palette, Database, Loader } from 'lucide-react';
import { fetchAPI } from '../utils/api';

interface Props { darkMode: boolean; onToggleDark: () => void; }

const settingsSections = [
  { id: 'categories', label: 'Donation Categories', icon: Settings2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'data', label: 'Data Management', icon: Database },
];

export default function Settings({ darkMode, onToggleDark }: Props) {
  const [activeSection, setActiveSection] = useState('categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');
  const [savedMsg, setSavedMsg] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    new_donation: true, new_message: true, pickup_updates: true,
    low_stock: true, weekly_report: false, email_digest: true,
  });

  useEffect(() => {
    loadCategories();
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await fetchAPI('/api/chat/preferences/mine/');
      setNotifSettings({
        new_donation: data.new_donation,
        new_message: data.new_message,
        pickup_updates: data.pickup_updates,
        low_stock: data.low_stock,
        weekly_report: data.weekly_report,
        email_digest: data.email_digest,
      });
    } catch (err) { console.error("Load prefs failed", err); }
  };

  const updatePreference = async (key: string, val: boolean) => {
    // Optimistic update
    setNotifSettings(prev => ({ ...prev, [key]: val }));
    try {
      await fetchAPI('/api/chat/preferences/mine/', {
        method: 'PATCH',
        body: JSON.stringify({ [key]: val })
      });
    } catch (err) {
      console.error("Update pref failed", err);
      // Revert if failed
      setNotifSettings(prev => ({ ...prev, [key]: !val }));
    }
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI('/api/donations/categories/');
      setCategories(data.results || data || []);
    } catch (err) {
      console.error("Load categories failed", err);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await fetchAPI('/api/donations/categories/', {
        method: 'POST',
        body: JSON.stringify({ name: newCatName.trim(), icon: newCatIcon, is_active: true })
      });
      setCategories(prev => [...prev, res]);
      setNewCatName('');
    } catch (err) {
      console.error("Add category failed", err);
    }
  };

  const removeCategory = async (id: number) => {
    if (!confirm("Are you sure? This will delete the category.")) return;
    try {
      await fetchAPI(`/api/donations/categories/${id}/`, { method: 'DELETE' });
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Delete category failed", err);
    }
  };

  const toggleCategory = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetchAPI(`/api/donations/categories/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !currentStatus })
      });
      setCategories(prev => prev.map(c => c.id === id ? res : c));
    } catch (err) {
      console.error("Toggle category failed", err);
    }
  };

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const exportData = async (type: 'donations' | 'users') => {
    try {
      const endpoint = type === 'donations' ? '/api/donations/' : '/api/users/profile/all_users/';
      const data = await fetchAPI(endpoint);
      const items = data.results || data || [];
      
      if (items.length === 0) {
        alert("No data found to export.");
        return;
      }

      // Simple CSV conversion
      const keys = Object.keys(items[0]);
      const csv = [
        keys.join(','),
        ...items.map((item: any) => keys.map(k => {
          let val = item[k];
          if (typeof val === 'object') val = JSON.stringify(val).replace(/,/g, ';');
          return `"${val}"`;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export data. Please try again.");
    }
  };

  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const textMain = darkMode ? 'text-white' : 'text-gray-800';
  const textSub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBg = darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500' : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400';
  const sideActive = darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700';
  const sideInactive = darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800';
  const divider = darkMode ? 'border-gray-700' : 'border-gray-100';
  const toggleOn = 'bg-green-500';
  const toggleOff = darkMode ? 'bg-gray-600' : 'bg-gray-300';

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`relative w-10 h-5.5 rounded-full transition-colors ${checked ? toggleOn : toggleOff} flex items-center`} style={{ height: '22px', width: '40px' }}>
      <span className={`absolute w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden flex min-h-[600px] ${card}`}>
      {/* Sidebar */}
      <div className={`w-56 border-r ${divider} flex-shrink-0 p-3 space-y-1`}>
        <p className={`text-xs font-semibold uppercase tracking-wider px-3 py-2 ${textSub}`}>Configuration</p>
        {settingsSections.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeSection === s.id ? sideActive : sideInactive}`}>
              <Icon size={15} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Categories */}
        {activeSection === 'categories' && (
          <div className="space-y-5 max-w-xl">
            <div>
              <h2 className={`font-bold text-base ${textMain}`}>Donation Categories</h2>
              <p className={`text-sm ${textSub} mt-1`}>Manage and customize donation categories available to donors.</p>
            </div>

            {/* Existing Categories */}
            <div className="space-y-2">
              {loading && <Loader className="animate-spin text-green-500 mx-auto" />}
              {categories.map(cat => (
                <div key={cat.id} className={`flex items-center gap-3 p-3.5 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-700/40' : 'border-gray-100 bg-gray-50'}`}>
                  <span className="text-xl">{cat.icon}</span>
                  <span className={`flex-1 font-medium text-sm ${textMain}`}>{cat.name}</span>
                  <Toggle checked={cat.is_active} onChange={() => toggleCategory(cat.id, cat.is_active)} />
                  <button onClick={() => removeCategory(cat.id)} className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Category */}
            <div className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-100 bg-gray-50'}`}>
              <p className={`text-sm font-semibold ${textMain} mb-3`}>Add New Category</p>
              <div className="flex gap-2">
                <input className={`w-16 px-2 py-2 rounded-xl border text-center text-lg ${inputBg}`} value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} placeholder="📦" />
                <input className={`flex-1 px-3 py-2 rounded-xl border text-sm ${inputBg}`} value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name..." onKeyDown={e => e.key === 'Enter' && addCategory()} />
                <button onClick={addCategory} className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-1.5">
                  <Plus size={13} /> Add
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Notifications */}
        {activeSection === 'notifications' && (
          <div className="space-y-5 max-w-xl">
            <div>
              <h2 className={`font-bold text-base ${textMain}`}>Notification Settings</h2>
              <p className={`text-sm ${textSub} mt-1`}>Control which notifications you receive.</p>
            </div>
            <div className="space-y-3">
              {Object.entries(notifSettings).map(([key, val]) => {
                const labels: Record<string, { label: string; desc: string }> = {
                  new_donation: { label: 'New Donations', desc: 'Alert when a new donation is received' },
                  new_message: { label: 'New Messages', desc: 'Alert when a donor sends a message' },
                  pickup_updates: { label: 'Pickup Updates', desc: 'Notify on pickup status changes' },
                  low_stock: { label: 'Low Stock Alerts', desc: 'Alert when inventory falls below threshold' },
                  weekly_report: { label: 'Weekly Reports', desc: 'Receive weekly performance digest' },
                  email_digest: { label: 'Email Digest', desc: 'Daily email summary of activities' },
                };
                return (
                  <div key={key} className={`flex items-center justify-between p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-100 bg-gray-50'}`}>
                    <div>
                      <p className={`font-medium text-sm ${textMain}`}>{labels[key]?.label}</p>
                      <p className={`text-xs ${textSub}`}>{labels[key]?.desc}</p>
                    </div>
                    <Toggle checked={val} onChange={() => updatePreference(key, !val)} />
                  </div>
                );
              })}
            </div>
          </div>
        )}



        {/* Data Management */}
        {activeSection === 'data' && (
          <div className="space-y-5 max-w-xl">
            <div>
              <h2 className={`font-bold text-base ${textMain}`}>Data Management</h2>
              <p className={`text-sm ${textSub} mt-1`}>Export, backup, and manage system data.</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Export Donations (CSV)', desc: 'Download all donation records as CSV', btn: 'Export', action: () => exportData('donations') },
                { label: 'Export Users (CSV)', desc: 'Download all user data as CSV', btn: 'Export', action: () => exportData('users') },
              ].map(item => (
                <div key={item.label} className={`flex items-center justify-between p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-100 bg-gray-50'}`}>
                  <div>
                    <p className={`font-medium text-sm ${textMain}`}>{item.label}</p>
                    <p className={`text-xs ${textSub}`}>{item.desc}</p>
                  </div>
                  <button onClick={item.action} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${darkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {item.btn}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
