import { useTranslation } from 'react-i18next';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useState } from 'react';

function Testimonials() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const testimonials = [
    {
      name: t('testimonials.testimonials.sarah.name'),
      text: t('testimonials.testimonials.sarah.text'),
      role: t('testimonials.testimonials.sarah.role'),
      initials: 'SK',
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/10'
    },
    {
      name: t('testimonials.testimonials.james.name'),
      text: t('testimonials.testimonials.james.text'),
      role: t('testimonials.testimonials.james.role'),
      initials: 'JM',
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/10'
    },
    {
      name: t('testimonials.testimonials.peter.name'),
      text: t('testimonials.testimonials.peter.text'),
      role: t('testimonials.testimonials.peter.role'),
      initials: 'PO',
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/10'
    }
  ];

  const prev = () => setActive((a) => (a === 0 ? testimonials.length - 1 : a - 1));
  const next = () => setActive((a) => (a === testimonials.length - 1 ? 0 : a + 1));

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 text-sm font-medium rounded-full mb-4 dark:bg-primary-900/30 dark:text-primary-400">{t('testimonials.badge')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 dark:text-gray-100">{t('testimonials.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => {
              const isCenter = i === active;
              const isSide = Math.abs(i - active) === 1 || (active === 0 && i === testimonials.length - 1) || (active === testimonials.length - 1 && i === 0);
              const isHidden = !isCenter && !isSide;

              return (
                <div key={t.name}
                  className={`relative bg-white rounded-2xl border p-8 transition-all duration-500 dark:bg-gray-800 ${
                    isCenter
                      ? 'border-primary-200 shadow-xl scale-100 opacity-100 z-10 dark:border-primary-800'
                      : isSide
                        ? 'border-gray-100 shadow-md scale-[0.95] opacity-70 hidden md:block dark:border-gray-700 dark:shadow-gray-900/50'
                        : 'hidden md:hidden'
                  }`}
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${t.gradient} opacity-[0.03]`}></div>

                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(5)].map((_, s) => (
                      <FiStar key={s} className="text-yellow-400 fill-current" size={16} />
                    ))}
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-8 relative z-10 dark:text-gray-300">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold shadow-lg ${t.shadow}`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{t.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
                    </div>
                  </div>

                  {isCenter && (
                    <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-lg`}>
                      <FiStar className="text-white" size={14} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button onClick={prev}
              className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-all shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-primary-900/30 dark:hover:border-primary-800 dark:shadow-gray-900/50">
              <FiChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === active ? 'bg-primary-600 w-6' : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
                  }`} />
              ))}
            </div>
            <button onClick={next}
              className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-all shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-primary-900/30 dark:hover:border-primary-800 dark:shadow-gray-900/50">
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
