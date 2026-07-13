import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowRight, FiAlertTriangle, FiOctagon, FiInfo, FiNavigation, FiImage } from 'react-icons/fi';

function RoadSigns() {
  const { t } = useTranslation();

  const categories = [
    { name: t('roadSigns.categories.warning.name'), count: 25, icon: FiAlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50', darkBg: 'dark:bg-yellow-950', border: 'border-yellow-200', darkBorder: 'dark:border-yellow-800', desc: t('roadSigns.categories.warning.desc') },
    { name: t('roadSigns.categories.regulatory.name'), count: 30, icon: FiOctagon, color: 'text-red-500', bg: 'bg-red-50', darkBg: 'dark:bg-red-950', border: 'border-red-200', darkBorder: 'dark:border-red-800', desc: t('roadSigns.categories.regulatory.desc') },
    { name: t('roadSigns.categories.guide.name'), count: 20, icon: FiNavigation, color: 'text-emerald-500', bg: 'bg-emerald-50', darkBg: 'dark:bg-emerald-950', border: 'border-emerald-200', darkBorder: 'dark:border-emerald-800', desc: t('roadSigns.categories.guide.desc') },
    { name: t('roadSigns.categories.information.name'), count: 15, icon: FiInfo, color: 'text-blue-500', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-950', border: 'border-blue-200', darkBorder: 'dark:border-blue-800', desc: t('roadSigns.categories.information.desc') },
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 text-sm font-medium rounded-full mb-4 dark:bg-primary-900/30 dark:text-primary-400">{t('roadSigns.badge')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 dark:text-gray-100">{t('roadSigns.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">{t('roadSigns.subtitle')}</p>
          <Link to="/library" className="inline-flex items-center gap-2 text-primary-600 font-medium hover:gap-3 transition-all mt-5">
            {t('roadSigns.browseFull')} <FiArrowRight size={18} />
          </Link>
          <Link to="/library/images" className="inline-flex items-center gap-2 text-amber-600 font-medium hover:gap-3 transition-all ml-4">
            <FiImage size={18} /> {t('roadSigns.viewSignImages')} <FiArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat.name}
              className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-center dark:bg-gray-800 dark:border-gray-700">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white via-white to-transparent pointer-events-none dark:from-gray-800 dark:via-gray-800"></div>
              <div className={`w-16 h-16 rounded-2xl ${cat.bg} ${cat.darkBg} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform relative`}>
                <cat.icon className={cat.color} size={30} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 relative dark:text-gray-100">{cat.name}</h3>
              <p className="text-sm text-gray-500 mb-5 relative leading-relaxed dark:text-gray-400">{cat.desc}</p>
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium border ${cat.bg} ${cat.color} ${cat.border} ${cat.darkBg} ${cat.darkBorder} relative`}>
                {cat.count} {t('common.signs')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RoadSigns;
