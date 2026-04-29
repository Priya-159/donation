import { useState, useEffect } from 'react';
import { MapPin, ExternalLink, Phone, Calendar, Loader, Search, X } from 'lucide-react';
import { fetchAPI } from '../utils/api';

interface Props { darkMode: boolean; }

const cityColors: Record<string, string> = {
  Brooklyn: 'bg-blue-100 text-blue-700',
  Queens: 'bg-purple-100 text-purple-700',
  Manhattan: 'bg-green-100 text-green-700',
  Bronx: 'bg-amber-100 text-amber-700',
  'Staten Island': 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  Completed: 'text-green-500',
  Scheduled: 'text-blue-500',
  Pending: 'text-amber-500',
  Cancelled: 'text-red-500',
};

export default function LocationTracking({ darkMode }: Props) {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetchAPI('/api/donations/');
        setDonations(res.results || res || []);
      } catch (err) {
        console.error('Failed to fetch location data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const textMain = darkMode ? 'text-white' : 'text-gray-800';
  const textSub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const rowHover = darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';
  const divider = darkMode ? 'divide-gray-700' : 'divide-gray-100';

  const extractCity = (d: any) => d.pickup_details?.city || 'Unknown';

  const citySummary = Object.entries(
    donations.reduce((acc, d) => {
      const city = extractCity(d);
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  const filteredDonations = donations.filter(d => {
    const q = search.toLowerCase();
    const address = d.pickup_details?.full_address || '';
    const city = d.pickup_details?.city || '';
    return !q || 
      d.donor.toLowerCase().includes(q) || 
      address.toLowerCase().includes(q) || 
      city.toLowerCase().includes(q);
  });

  const openMaps = (address: string, city: string) => {
    const query = encodeURIComponent(`${address}, ${city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader className="animate-spin text-green-500 w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* City Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {citySummary.length === 0 ? (
          <div className={`col-span-full text-center py-4 ${textSub}`}>No locations recorded yet</div>
        ) : citySummary.map(([city, count]) => (
          <div key={city} className={`rounded-2xl border p-4 shadow-sm ${card} flex flex-col items-center text-center hover:shadow-md transition-shadow`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <MapPin size={18} className="text-green-500" />
            </div>
            <p className={`font-bold text-lg ${textMain}`}>{count}</p>
            <p className={`text-xs font-medium ${textSub}`}>{city}</p>
          </div>
        ))}
      </div>

      {/* Visual Map Placeholder */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
        <div className={`px-5 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`font-bold text-base ${textMain}`}>Donation Location Map</h2>
          <p className={`text-xs ${textSub}`}>Visual overview of all donation addresses across NYC</p>
        </div>
        <div className={`relative overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-slate-50'}`} style={{ height: '320px' }}>
          {/* SVG Map of NYC boroughs */}
          <svg viewBox="0 0 600 400" className="w-full h-full opacity-80">
            <defs>
              <radialGradient id="glow-green" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Background */}
            <rect width="600" height="400" fill={darkMode ? '#111827' : '#e2e8f0'} />
            {/* Water */}
            <ellipse cx="300" cy="200" rx="280" ry="180" fill={darkMode ? '#1e3a5f' : '#bfdbfe'} opacity="0.3" />

            {/* Borough shapes (simplified) */}
            {/* Manhattan */}
            <ellipse cx="280" cy="160" rx="40" ry="80" fill={darkMode ? '#16a34a' : '#86efac'} opacity="0.6" />
            {/* Brooklyn */}
            <ellipse cx="310" cy="280" rx="70" ry="50" fill={darkMode ? '#15803d' : '#a7f3d0'} opacity="0.5" />
            {/* Queens */}
            <ellipse cx="400" cy="200" rx="80" ry="60" fill={darkMode ? '#166534' : '#bbf7d0'} opacity="0.5" />
            {/* Bronx */}
            <ellipse cx="290" cy="90" rx="60" ry="40" fill={darkMode ? '#14532d' : '#d1fae5'} opacity="0.5" />
            {/* Staten Island */}
            <ellipse cx="160" cy="310" rx="55" ry="40" fill={darkMode ? '#052e16' : '#ecfdf5'} opacity="0.5" />

            {/* Borough Labels */}
            <text x="280" y="158" textAnchor="middle" fontSize="11" fontWeight="bold" fill={darkMode ? '#86efac' : '#15803d'}>Manhattan</text>
            <text x="310" y="282" textAnchor="middle" fontSize="11" fontWeight="bold" fill={darkMode ? '#86efac' : '#15803d'}>Brooklyn</text>
            <text x="400" y="202" textAnchor="middle" fontSize="11" fontWeight="bold" fill={darkMode ? '#86efac' : '#15803d'}>Queens</text>
            <text x="290" y="90" textAnchor="middle" fontSize="11" fontWeight="bold" fill={darkMode ? '#86efac' : '#15803d'}>Bronx</text>
            <text x="160" y="312" textAnchor="middle" fontSize="10" fontWeight="bold" fill={darkMode ? '#86efac' : '#15803d'}>Staten Island</text>

            {/* Donation Pins dynamically derived */}
            {citySummary.map(([city, count], i) => {
              // Map dynamic cities to SVG coordinates roughly
              let cx = 300, cy = 200; // default center
              if (city.toLowerCase().includes('manhattan')) { cx = 280; cy = 150; }
              else if (city.toLowerCase().includes('brooklyn')) { cx = 318; cy = 272; }
              else if (city.toLowerCase().includes('queens')) { cx = 408; cy = 198; }
              else if (city.toLowerCase().includes('bronx')) { cx = 285; cy = 88; }
              else if (city.toLowerCase().includes('staten')) { cx = 155; cy = 308; }
              else { cx = 200 + (i * 30); cy = 150 + (i * 30); } // Scatter unknown cities
              
              return (
                <g key={city}>
                  <circle cx={cx} cy={cy} r="20" fill="url(#glow-green)" />
                  <circle cx={cx} cy={cy} r="10" fill="#22c55e" opacity="0.9" />
                  <circle cx={cx} cy={cy} r="5" fill="white" />
                  <text x={cx} y={cy - 16} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#22c55e">{count}</text>
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} shadow`}>
              🟢 Active Donations
            </div>
          </div>
        </div>
      </div>

      {/* Address List */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
        <div className={`px-5 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-bold text-base ${textMain}`}>All Donation Addresses</h2>
              <p className={`text-xs ${textSub}`}>{filteredDonations.length} of {donations.length} addresses tracked</p>
            </div>
            {/* Search Bar */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm max-w-xs w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-700'}`}>
              <Search size={14} className={textSub} />
              <input 
                className="bg-transparent outline-none flex-1 text-xs" 
                placeholder="Search by donor, city, or address..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
              {search && <button onClick={() => setSearch('')}><X size={12} className={textSub} /></button>}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                {['Donor', 'Address', 'City', 'Category', 'Status', 'Date', 'Maps'].map(h => (
                  <th key={h} className={`px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${textSub}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${divider}`}>
              {filteredDonations.length === 0 ? (
                 <tr>
                   <td colSpan={7} className={`py-8 text-center ${textSub}`}>No matching locations found.</td>
                 </tr>
              ) : filteredDonations.map((d: any) => (
                <tr key={d.id} className={`transition-colors ${rowHover}`}>
                  <td className={`px-5 py-3.5 ${textMain} font-medium`}>
                    <div>{d.donor}</div>
                    <div className={`flex items-center gap-1 text-xs ${textSub} mt-0.5`}>
                      <Phone size={10} /> N/A
                    </div>
                  </td>
                  <td className={`px-5 py-3.5 ${textSub}`}>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="flex-shrink-0" />
                      {d.pickup_details?.full_address || 'No address provided'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cityColors[extractCity(d)] || 'bg-gray-100 text-gray-700'}`}>{extractCity(d)}</span>
                  </td>
                  <td className={`px-5 py-3.5 ${textSub}`}>{d.category}</td>
                  <td className={`px-5 py-3.5 font-semibold text-xs ${statusColors[d.status] || 'text-gray-500'}`}>{d.status}</td>
                  <td className={`px-5 py-3.5 ${textSub}`}>
                    <div className="flex items-center gap-1">
                      <Calendar size={11} /> {new Date(d.timestamp).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => openMaps(d.pickup_details?.full_address, extractCity(d))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors"
                      disabled={!d.pickup_details?.full_address}
                    >
                      <ExternalLink size={11} />
                      Open Map
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
