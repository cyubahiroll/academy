import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import roadSigns, { categories } from '../../data/roadSignsData';
import { FiArrowLeft, FiGrid, FiSearch, FiBookOpen, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const categoryColors = {
  Regulatory: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  Warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  'Traffic Control': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  Guide: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
};

function BookImages() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = roadSigns.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || s.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <>
      <Helmet><title>{t('bookImages.pageTitle')}</title></Helmet>

      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <button onClick={() => navigate('/library')}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <FiArrowLeft size={20} />
              </button>
              <h1 className="text-3xl md:text-4xl font-bold">{t('bookImages.title')}</h1>
            </div>
            <p className="text-lg text-primary-100 ml-12">{t('bookImages.subtitle')}</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/50 p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input type="text" placeholder={t('bookImages.searchPlaceholder')} value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['all', ...categories].map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                {cat === 'all' ? t('bookImages.allSigns') : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center gap-2 mb-6">
          <FiGrid className="text-primary-600" size={18} />
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('bookImages.signsFound', { count: filtered.length })}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <FiBookOpen className="mx-auto text-gray-300 dark:text-gray-600" size={48} />
            <p className="text-gray-500 dark:text-gray-400 mt-4">{t('bookImages.noSigns')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((sign) => (
              <div key={sign.id}
                onClick={() => setSelected(sign)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border hover:shadow-lg dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all cursor-pointer group overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-400"></div>
                <div className="p-5 flex flex-col items-center">
                  <div className="w-32 h-32 flex items-center justify-center mb-4 p-2">
                    <img src={sign.image} alt={sign.name}
                      className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-center group-hover:text-primary-600 transition-colors">{sign.name}</h3>
                  <span className={`mt-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${categoryColors[sign.category] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}>
                    {sign.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="w-56 h-56 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <img src={selected.image} alt={selected.name}
                      className="w-full h-full object-contain drop-shadow-lg" />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${categoryColors[selected.category] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}>
                    {selected.category}
                  </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('bookImages.description')}</h4>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{selected.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('bookImages.referenceInBook')}</h4>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{selected.bookReference}</p>
                  </div>
                  <button onClick={() => { setSelected(null); navigate('/library'); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                    <FiBookOpen size={14} /> {t('bookImages.viewInLibrary')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BookImages;
