import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiChevronDown, FiHelpCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const faqKeys = ['account', 'free', 'subscription', 'attempts', 'certificate', 'materials', 'aiChat', 'payment', 'resetPassword', 'mobile'];

function Faq() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Helmet><title>{t('faq.pageTitle')}</title></Helmet>

      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <FiHelpCircle size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('faq.title')}</h1>
          <p className="text-xl text-primary-100">{t('faq.subtitle')}</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 -mt-10 relative z-10 mb-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
          {faqKeys.map((key, index) => (
            <div key={index} className="transition-colors">
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="text-gray-900 dark:text-gray-100 font-medium pr-4">{t(`faq.questions.${key}.q`)}</span>
                <FiChevronDown
                  size={20}
                  className={`shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-5 md:px-6 pb-5 md:pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t(`faq.questions.${key}.a`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Faq;
