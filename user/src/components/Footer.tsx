import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const { dark, t } = useApp();

  return (
    <footer className={`${dark ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'} border-t`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Seva<span className="gradient-text">Setu</span></span>
            </div>
            <p className={`text-sm leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.footer.tagline}</p>
            <div className="flex gap-3 mt-4">
              {['facebook', 'twitter', 'instagram'].map(s => (
                <a key={s} href="#" className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${dark ? 'bg-slate-800 text-gray-400 hover:bg-primary-900/50 hover:text-primary-400' : 'bg-gray-100 text-gray-500 hover:bg-primary-50 hover:text-primary-600'}`}>
                  <span className="text-xs font-bold uppercase">{s[0]}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>{t.footer.quickLinks}</h4>
            <div className="space-y-2">
              {[{ to: '/', label: t.nav.home }, { to: '/categories', label: t.nav.categories }, { to: '/about', label: t.nav.about }, { to: '/volunteer', label: t.nav.volunteer }, { to: '/stories', label: t.nav.stories }].map(l => (
                <Link key={l.to} to={l.to} className={`block text-sm transition-colors ${dark ? 'text-gray-400 hover:text-primary-400' : 'text-gray-500 hover:text-primary-600'}`}>{l.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>{t.footer.contact}</h4>
            <div className="space-y-3">
              <div className={`flex items-start gap-2 text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>123 Seva Marg, Andheri West, Mumbai 400058</span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>hello@sevasetu.org</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Newsletter</h4>
            <p className={`text-sm mb-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Stay updated with our impact stories</p>
            <div className="flex gap-2">
              <input type="email" placeholder="your@email.com" className={`flex-1 px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-200 placeholder:text-gray-400'} focus:outline-none focus:ring-2 focus:ring-primary-500`} />
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">Go</button>
            </div>
          </div>
        </div>

        <div className={`mt-10 pt-6 border-t ${dark ? 'border-slate-800' : 'border-gray-200'} flex flex-col sm:flex-row items-center justify-between gap-2`}>
          <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{t.footer.rights}</p>
          <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{t.footer.madeWith}</p>
        </div>
      </div>
    </footer>
  );
}
