import { useTranslation } from 'react-i18next';
import { FiBook, FiPlayCircle, FiShield, FiSmartphone } from 'react-icons/fi';

function HowWeHelp() {
  const { t } = useTranslation();
  const features = [
    {
      icon: FiBook,
      title: t('howWeHelp.features.roadRules.title'),
      description: t('howWeHelp.features.roadRules.description'),
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      darkBg: 'dark:bg-blue-950'
    },
    {
      icon: FiPlayCircle,
      title: t('howWeHelp.features.interactive.title'),
      description: t('howWeHelp.features.interactive.description'),
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      darkBg: 'dark:bg-purple-950'
    },
    {
      icon: FiShield,
      title: t('howWeHelp.features.confidence.title'),
      description: t('howWeHelp.features.confidence.description'),
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      darkBg: 'dark:bg-emerald-950'
    },
    {
      icon: FiSmartphone,
      title: t('howWeHelp.features.anywhere.title'),
      description: t('howWeHelp.features.anywhere.description'),
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
      darkBg: 'dark:bg-amber-950'
    }
  ];
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 text-sm font-medium rounded-full mb-4 dark:bg-primary-900/30 dark:text-primary-400">{t('howWeHelp.badge')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 dark:text-gray-100">{t('howWeHelp.title')}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto dark:text-gray-300">
            {t('howWeHelp.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature) => (
            <div key={feature.title}
              className="group relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.darkBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className="text-gray-700 dark:text-gray-200" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 dark:text-gray-100">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed dark:text-gray-400">{feature.description}</p>
              <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r ${feature.color} scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowWeHelp;
