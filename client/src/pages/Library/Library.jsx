import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import libraryService from '../../services/libraryService';
import { FiSearch, FiFileText, FiBookOpen, FiDownload, FiLock, FiImage } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const fileIcons = {
  pdf: 'bg-red-100 dark:bg-red-900/30 text-red-600',
  doc: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  docx: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  txt: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
};

function Library() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => { loadDocuments(); }, []);

  const loadDocuments = async () => {
    try {
      const data = await libraryService.getAll();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set((Array.isArray(documents) ? documents : []).map(d => d.category_name).filter(Boolean))];

  const filtered = (Array.isArray(documents) ? documents : []).filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = categoryFilter === 'all' || d.category_name === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleRead = (docId) => {
    if (isAuthenticated) {
      navigate(`/reader/${docId}`);
    } else {
      navigate(`/login?redirect=/reader/${docId}`);
    }
  };

  return (
    <>
      <Helmet><title>{t('library.pageTitle')}</title></Helmet>

      <section className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-800 text-white animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{t('library.title')}</h1>
            <p className="text-base md:text-lg text-white/70">{t('library.subtitle')}</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-5 relative z-10 mb-6 space-y-3">
        <Link to="/library/images"
          className="dash-card block p-4 hover:border-amber-300 dark:hover:border-amber-700 group animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <FiImage size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm" style={{ color: 'rgb(var(--text-primary))' }}>{t('library.visualGuide')}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>{t('library.visualGuideDesc')}</p>
            </div>
            <span className="shrink-0 btn-ghost text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:text-amber-700">
              {t('library.browseImages')} →
            </span>
          </div>
        </Link>

        <div className="dash-card p-4 animate-slide-up" style={{ animationDelay: '60ms' }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'rgb(var(--text-tertiary))' }} />
              <input type="text" placeholder={t('library.searchPlaceholder')} value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="dash-input pl-9" />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hidden">
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    categoryFilter === cat
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/25'
                      : 'border hover:border-primary-300 dark:hover:border-primary-600'
                  }`}
                  style={categoryFilter !== cat ? {
                    background: 'rgb(var(--surface-elevated))',
                    borderColor: 'rgb(var(--border))',
                    color: 'rgb(var(--text-secondary))'
                  } : undefined}>
                  {cat === 'all' ? t('common.all') : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent border-primary-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="dash-card text-center py-16 animate-fade-in" style={{ background: 'rgb(var(--surface-elevated))', borderColor: 'transparent' }}>
            <FiBookOpen className="mx-auto mb-3" size={40} style={{ color: 'rgb(var(--text-tertiary))' }} />
            <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>{t('library.noDocuments')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-stagger">
            {filtered.map((doc) => {
              const rawExt = doc.file_url?.split('.').pop()?.toLowerCase() || '';
              const mimeExt = doc.file_type?.split('/').pop()?.toLowerCase() || '';
              const ext = ['pdf','doc','docx','txt'].includes(rawExt) ? rawExt : (['pdf','doc','docx','txt'].includes(mimeExt) ? mimeExt : rawExt || 'file');
              const iconClass = fileIcons[ext] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
              return (
                <div key={doc.id}
                  onClick={() => handleRead(doc.id)}
                  className="dash-card cursor-pointer group overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-primary-500 to-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
                        <FiFileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm leading-snug truncate group-hover:text-primary-600 transition-colors"
                          style={{ color: 'rgb(var(--text-primary))' }}>{doc.title}</h3>
                        {doc.category_name && (
                          <span className="badge-info mt-1 text-[10px]">{doc.category_name}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-2 mb-4"
                      style={{ color: 'rgb(var(--text-secondary))' }}>
                      {doc.description || t('common.noDescription')}
                    </p>
                    <div className="flex items-center justify-between pt-3"
                      style={{ borderTop: '1px solid rgb(var(--border))' }}>
                      <span className="flex items-center gap-1.5 text-[11px]"
                        style={{ color: 'rgb(var(--text-tertiary))' }}>
                        <FiDownload size={12} /> {t('library.downloadCount', { count: doc.download_count || 0 })}
                      </span>
                      {isAuthenticated ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-primary-600 group-hover:gap-2.5 transition-all">
                          <FiBookOpen size={13} /> {t('library.readOnline')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'rgb(var(--text-tertiary))' }}>
                          <FiLock size={13} /> {t('library.loginToRead')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default Library;
