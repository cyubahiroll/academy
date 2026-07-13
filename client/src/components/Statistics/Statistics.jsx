import { useTranslation } from 'react-i18next';
import { FiBookOpen, FiFileText, FiClipboard, FiAward } from 'react-icons/fi';

function Statistics() {
  const { t } = useTranslation();
  const stats = [
    { icon: FiBookOpen, value: '50+', label: t('statistics.videoLessons'), color: 'from-cyan-400 to-blue-500' },
    { icon: FiClipboard, value: '200+', label: t('statistics.quizQuestions'), color: 'from-purple-400 to-purple-600' },
    { icon: FiFileText, value: '90+', label: t('statistics.roadSigns'), color: 'from-amber-400 to-orange-500' },
    { icon: FiAward, value: '1,000+', label: t('statistics.activeStudents'), color: 'from-emerald-400 to-green-500' },
  ];
  return (
    <section className="relative -mt-10 z-10 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div key={stat.label}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900/50">
              <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} items-center justify-center mb-3`}>
                <stat.icon className="text-white" size={22} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1 dark:text-gray-100">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Statistics;
