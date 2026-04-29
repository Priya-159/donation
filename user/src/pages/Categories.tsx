import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Utensils, Shirt, BookOpen, Banknote, Sprout, ArrowRight, Heart } from 'lucide-react';

export default function Categories() {
  const { dark, t } = useApp();

  const categories = [
    { icon: Utensils, title: t.categories.food, desc: t.categories.foodDesc, impact: t.categories.foodImpact, color: 'from-orange-400 to-red-500', bgLight: 'bg-orange-50', bgDark: 'bg-orange-900/20', emoji: '🍲', stats: '5,000+ meals/month' },
    { icon: Shirt, title: t.categories.clothes, desc: t.categories.clothesDesc, impact: t.categories.clothesImpact, color: 'from-blue-400 to-indigo-500', bgLight: 'bg-blue-50', bgDark: 'bg-blue-900/20', emoji: '👕', stats: '2,000+ items/month' },
    { icon: BookOpen, title: t.categories.books, desc: t.categories.booksDesc, impact: t.categories.booksImpact, color: 'from-purple-400 to-pink-500', bgLight: 'bg-purple-50', bgDark: 'bg-purple-900/20', emoji: '📚', stats: '500+ students/month' },
    { icon: Banknote, title: t.categories.money, desc: t.categories.moneyDesc, impact: t.categories.moneyImpact, color: 'from-green-400 to-emerald-500', bgLight: 'bg-green-50', bgDark: 'bg-green-900/20', emoji: '💰', stats: '₹10L+ raised' },
    { icon: Sprout, title: t.categories.trees, desc: t.categories.treesDesc, impact: t.categories.treesImpact, color: 'from-teal-400 to-cyan-500', bgLight: 'bg-teal-50', bgDark: 'bg-teal-900/20', emoji: '🌱', stats: '12,000+ trees planted' },
  ];

  return (
    <div className={`min-h-screen pt-24 pb-16 ${dark ? 'bg-slate-900' : 'bg-gradient-to-b from-primary-50/30 to-white'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4 ${dark ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-700'}`}>
            <Heart className="w-4 h-4" /> Choose Your Cause
          </div>
          <h1 className={`text-4xl sm:text-5xl font-bold font-serif ${dark ? 'text-white' : 'text-gray-900'}`}>{t.categories.title}</h1>
          <p className={`mt-4 text-lg max-w-2xl mx-auto ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.categories.sub}</p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto mt-6 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <div key={i} className={`group rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${dark ? 'bg-slate-800 shadow-lg shadow-slate-900/50' : 'bg-white shadow-lg shadow-gray-100/50 border border-gray-100'}`}>
              <div className={`h-44 bg-gradient-to-br ${cat.color} relative flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10" />
                </div>
                <span className="text-7xl group-hover:scale-110 transition-transform duration-500">{cat.emoji}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{cat.title}</h3>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md`}>
                    <cat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className={`text-sm leading-relaxed mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{cat.desc}</p>
                <div className={`flex items-center justify-between mb-5`}>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${dark ? cat.bgDark + ' text-primary-300' : cat.bgLight + ' text-primary-700'}`}>
                    {cat.impact}
                  </span>
                  <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{cat.stats}</span>
                </div>
                <Link to="/donate" className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r ${cat.color} text-white shadow-md hover:shadow-lg hover:-translate-y-0.5`}>
                  {t.nav.donate} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
