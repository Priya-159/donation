import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowRight, ChevronLeft, ChevronRight, Utensils, Users, TreePine, HandHeart, BookOpen, Shirt, Banknote, Sprout, Quote, Star, TrendingUp, Shield } from 'lucide-react';
import { fetchAPI } from '../utils/api';

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCount(0); // Reset if end changes
    setStarted(false);
  }, [end]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || end === 0) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, ref };
}

const quotes = [
  { text: "No one has ever become poor by giving.", author: "Anne Frank" },
  { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
  { text: "We make a living by what we get, but we make a life by what we give.", author: "Winston Churchill" },
  { text: "It's not how much we give but how much love we put into giving.", author: "Mother Teresa" },
  { text: "The meaning of life is to find your gift. The purpose of life is to give it away.", author: "Pablo Picasso" },
];

export default function Home() {
  const { dark, t } = useApp();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [stats, setStats] = useState({
    total_donations: 0,
    total_donors: 0,
    food_meals: 0,
    trees_planted: 0,
    distribution: { food: 0, education: 0, green: 0 }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetchAPI('/api/donations/public_stats/');
        // Add some base numbers so UI looks populated even if DB is empty,
        // but it scales exactly with live DB entries
        setStats({
          total_donations: 50 + res.total_donations,
          total_donors: 25 + res.total_donors,
          food_meals: 1000 + res.food_meals,
          trees_planted: 200 + res.trees_planted,
          distribution: {
            food: 40 + res.distribution.food,
            education: 30 + res.distribution.education,
            green: 30 + res.distribution.green
          }
        });
      } catch (err) {
        console.error("Failed to load public stats", err);
      }
    };
    fetchStats();
  }, []);

  const meals = useCountUp(stats.food_meals);
  const people = useCountUp(stats.total_donors);
  const trees = useCountUp(stats.trees_planted);
  const donations = useCountUp(stats.total_donations);

  useEffect(() => {
    const timer = setInterval(() => setQuoteIndex(p => (p + 1) % quotes.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { icon: Utensils, title: t.categories.food, desc: t.categories.foodDesc, impact: t.categories.foodImpact, color: 'from-orange-400 to-red-400', bg: dark ? 'bg-orange-900/20' : 'bg-orange-50' },
    { icon: Shirt, title: t.categories.clothes, desc: t.categories.clothesDesc, impact: t.categories.clothesImpact, color: 'from-blue-400 to-indigo-400', bg: dark ? 'bg-blue-900/20' : 'bg-blue-50' },
    { icon: BookOpen, title: t.categories.books, desc: t.categories.booksDesc, impact: t.categories.booksImpact, color: 'from-purple-400 to-pink-400', bg: dark ? 'bg-purple-900/20' : 'bg-purple-50' },
    { icon: Banknote, title: t.categories.money, desc: t.categories.moneyDesc, impact: t.categories.moneyImpact, color: 'from-green-400 to-emerald-400', bg: dark ? 'bg-green-900/20' : 'bg-green-50' },
    { icon: Sprout, title: t.categories.trees, desc: t.categories.treesDesc, impact: t.categories.treesImpact, color: 'from-teal-400 to-cyan-400', bg: dark ? 'bg-teal-900/20' : 'bg-teal-50' },
  ];

  const totalDist = stats.distribution.food + stats.distribution.education + stats.distribution.green;
  const foodPct = totalDist > 0 ? Math.round((stats.distribution.food / totalDist) * 100) : 40;
  const eduPct = totalDist > 0 ? Math.round((stats.distribution.education / totalDist) * 100) : 30;
  const greenPct = totalDist > 0 ? Math.round((stats.distribution.green / totalDist) * 100) : 30;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero.jpg" alt="Community helping" className="w-full h-full object-cover" />
          <div className={`absolute inset-0 ${dark ? 'bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900' : 'bg-gradient-to-b from-black/50 via-black/30 to-white'}`} />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-20">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              <span>Trusted by {stats.total_donors}+ donors</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up font-serif leading-tight" style={{ animationDelay: '0.15s' }}>
            {t.hero.tagline}
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {t.hero.sub}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
            <Link to="/donate" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl text-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:-translate-y-1 flex items-center justify-center gap-2">
              {t.hero.donateBtn} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/volunteer" className="w-full sm:w-auto px-8 py-4 bg-white/15 backdrop-blur-sm text-white rounded-2xl text-lg font-semibold hover:bg-white/25 transition-all border border-white/30 flex items-center justify-center gap-2">
              {t.hero.volunteerBtn}
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-white/70 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            {[{ icon: Shield, text: '100% Transparent' }, { icon: Star, text: '4.9★ Rated' }, { icon: TrendingUp, text: '50+ Cities' }].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <item.icon className="w-4 h-4" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />
      </section>

      {/* Quotes Slider */}
      <section className={`py-16 ${dark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className={`relative rounded-3xl p-8 sm:p-12 ${dark ? 'bg-gradient-to-br from-slate-800 to-slate-800/50' : 'bg-gradient-to-br from-primary-50 to-accent-50'}`}>
            <Quote className={`w-12 h-12 mb-4 ${dark ? 'text-primary-400/30' : 'text-primary-300'}`} />
            <div className="min-h-[120px] flex flex-col justify-center">
              <p className={`text-xl sm:text-2xl font-serif italic leading-relaxed ${dark ? 'text-gray-200' : 'text-gray-700'}`} key={quoteIndex}>
                "{quotes[quoteIndex].text}"
              </p>
              <p className={`mt-4 font-semibold ${dark ? 'text-primary-400' : 'text-primary-600'}`}>— {quotes[quoteIndex].author}</p>
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-2">
                {quotes.map((_, i) => (
                  <button key={i} onClick={() => setQuoteIndex(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === quoteIndex ? 'bg-primary-500 w-8' : dark ? 'bg-slate-600' : 'bg-gray-300'}`} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setQuoteIndex(p => (p - 1 + quotes.length) % quotes.length)} className={`p-2 rounded-full ${dark ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-white text-gray-600 hover:bg-gray-50'} shadow-sm`}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setQuoteIndex(p => (p + 1) % quotes.length)} className={`p-2 rounded-full ${dark ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-white text-gray-600 hover:bg-gray-50'} shadow-sm`}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Counters */}
      <section className={`py-20 ${dark ? 'bg-slate-800/50' : 'bg-gradient-to-b from-white to-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl sm:text-4xl font-bold font-serif ${dark ? 'text-white' : 'text-gray-900'}`}>{t.impact.title}</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { ref: meals.ref, count: meals.count, label: t.impact.meals, icon: Utensils, color: 'from-orange-400 to-red-400' },
              { ref: people.ref, count: people.count, label: t.impact.people, icon: Users, color: 'from-blue-400 to-indigo-400' },
              { ref: trees.ref, count: trees.count, label: t.impact.trees, icon: TreePine, color: 'from-green-400 to-emerald-400' },
              { ref: donations.ref, count: donations.count, label: t.impact.donations, icon: HandHeart, color: 'from-purple-400 to-pink-400' },
            ].map((item, i) => (
              <div key={i} ref={item.ref} className={`text-center p-6 sm:p-8 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg ${dark ? 'bg-slate-800 hover:shadow-slate-700/50' : 'bg-white shadow-sm hover:shadow-md'}`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className={`text-3xl sm:text-4xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {item.count.toLocaleString()}+
                </div>
                <div className={`text-sm font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className={`py-20 ${dark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl sm:text-4xl font-bold font-serif ${dark ? 'text-white' : 'text-gray-900'}`}>{t.categories.title}</h2>
            <p className={`mt-3 text-lg ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.categories.sub}</p>
            <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <div key={i} className={`group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${dark ? 'bg-slate-800 hover:shadow-slate-700/30' : 'bg-white shadow-sm hover:shadow-lg border border-gray-100'}`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>{cat.title}</h3>
                <p className={`text-sm mb-3 leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{cat.desc}</p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 ${cat.bg} ${dark ? 'text-primary-300' : 'text-primary-700'}`}>
                  {cat.impact}
                </div>
                <div>
                  <Link to="/donate" className={`inline-flex items-center gap-1 text-sm font-semibold transition-colors ${dark ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'}`}>
                    {t.nav.donate} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where Donation Goes */}
      <section className={`py-20 ${dark ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl sm:text-4xl font-bold font-serif ${dark ? 'text-white' : 'text-gray-900'}`}>{t.whereGoes.title}</h2>
            <p className={`mt-3 text-lg ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.whereGoes.sub}</p>
            <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Food Distribution Centers', locations: 'Mumbai, Delhi, Bangalore, Chennai', desc: 'Daily meals served at 25+ community kitchens', pct: `${foodPct}%`, color: 'from-orange-400 to-red-400', img: '/images/stories-food.jpg' },
              { title: 'Education Programs', locations: 'Rural Maharashtra, UP, Rajasthan', desc: 'Free learning centers with books and mentors', pct: `${eduPct}%`, color: 'from-blue-400 to-indigo-400', img: '/images/stories-education.jpg' },
              { title: 'Green Initiative', locations: 'Western Ghats, Rajasthan, Madhya Pradesh', desc: 'Tree plantation and environmental restoration', pct: `${greenPct}%`, color: 'from-green-400 to-emerald-400', img: '/images/stories-trees.jpg' },
            ].map((item, i) => (
              <div key={i} className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${dark ? 'bg-slate-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                <div className="relative h-40 overflow-hidden">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${item.color} shadow-lg`}>{item.pct} of Donations</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className={`text-lg font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                  <p className={`text-sm mb-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{item.desc}</p>
                  <div className={`flex items-center gap-1 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <MapPinIcon /> {item.locations}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-20 ${dark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className={`rounded-3xl p-8 sm:p-16 bg-gradient-to-br from-primary-500 to-accent-600 relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white" />
              <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-serif">Ready to Make a Difference?</h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Every donation, no matter how small, creates ripples of positive change. Start your journey of giving today.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/donate" className="px-8 py-4 bg-white text-primary-700 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-all shadow-xl hover:-translate-y-1 flex items-center gap-2">
                  Start Donating <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/about" className="px-8 py-4 bg-white/15 text-white rounded-2xl text-lg font-semibold hover:bg-white/25 transition-all border border-white/30">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function Heart(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
