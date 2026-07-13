import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { FiTarget, FiEye, FiHeart, FiUsers, FiAward, FiBook, FiPlayCircle, FiShield, FiSmartphone, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import teamMemberService from '../../services/teamMemberService';
import apiUrl from '../../utils/apiUrl';

function About() {
  const { t } = useTranslation();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  const features = [
    { icon: FiBook, title: t('about.features.roadRules.title'), description: t('about.features.roadRules.desc') },
    { icon: FiPlayCircle, title: t('about.features.interactive.title'), description: t('about.features.interactive.desc') },
    { icon: FiShield, title: t('about.features.confidence.title'), description: t('about.features.confidence.desc') },
    { icon: FiSmartphone, title: t('about.features.anywhere.title'), description: t('about.features.anywhere.desc') },
  ];

  const cards = [
    { icon: FiTarget, title: t('about.mission.title'), description: t('about.mission.desc'), color: 'from-blue-500 to-blue-600' },
    { icon: FiEye, title: t('about.vision.title'), description: t('about.vision.desc'), color: 'from-purple-500 to-purple-600' },
    { icon: FiHeart, title: t('about.values.title'), description: t('about.values.desc'), color: 'from-rose-500 to-rose-600' },
    { icon: FiUsers, title: t('about.whoWeServe.title'), description: t('about.whoWeServe.desc'), color: 'from-emerald-500 to-emerald-600' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await teamMemberService.getAll(true);
        setTeam(data);
      } catch (_e) {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <Helmet><title>{t('about.pageTitle')}</title></Helmet>

      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('about.title')}</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-8 md:p-12 mb-16">
          <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg mb-6">
            {t('about.para1')}
          </p>
          <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg">
            {t('about.para2')}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div key={card.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/50 border overflow-hidden group hover:shadow-lg transition-shadow">
              <div className={`bg-gradient-to-r ${card.color} p-5 flex items-center gap-3`}>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <card.icon className="text-white" size={22} />
                </div>
                <h3 className="text-white font-semibold text-base">{card.title}</h3>
              </div>
              <div className="p-5">
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-950 rounded-full mb-4">
            <FiAward className="text-amber-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('about.hallOfFame')}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t('about.hallOfFameSub')}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : team.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">{t('about.noTeam')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/50 border p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 bg-gray-100 dark:bg-gray-800 overflow-hidden border-4 border-amber-100 dark:border-amber-950">
                  {member.image_url ? (
                    <img src={apiUrl(member.image_url)} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400 dark:text-gray-500">
                      {member.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{member.name}</h3>
                <p className="text-sm font-medium text-amber-600 mb-2">{member.role}</p>
                {member.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{member.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('about.howWeHelpTitle')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('about.howWeHelpSub')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/50 border p-6 text-center group hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary-600 transition-colors">
                  <feature.icon className="text-primary-600 group-hover:text-white transition-colors" size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default About;
