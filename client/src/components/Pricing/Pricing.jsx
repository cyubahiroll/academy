import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiCheck, FiStar } from 'react-icons/fi';

function Pricing() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const plans = [
    {
      name: t('pricing.plans.monthly.name'),
      price: '25,000',
      currency: 'UGX',
      period: t('pricing.plans.monthly.period'),
      features: t('pricing.plans.monthly.features', { returnObjects: true }),
      popular: false
    },
    {
      name: t('pricing.plans.quarterly.name'),
      price: '60,000',
      currency: 'UGX',
      period: t('pricing.plans.quarterly.period'),
      features: t('pricing.plans.quarterly.features', { returnObjects: true }),
      popular: true
    },
    {
      name: t('pricing.plans.yearly.name'),
      price: '200,000',
      currency: 'UGX',
      period: t('pricing.plans.yearly.period'),
      features: t('pricing.plans.yearly.features', { returnObjects: true }),
      popular: false
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900" id="pricing">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 text-sm font-medium rounded-full mb-4 dark:bg-primary-900/30 dark:text-primary-400">{t('pricing.badge')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 dark:text-gray-100">{t('pricing.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name}
              className={`relative bg-white rounded-2xl p-8 transition-all duration-300 dark:bg-gray-800 ${
                plan.popular
                  ? 'border-2 border-primary-500 shadow-xl shadow-primary-500/10 scale-105 md:scale-105'
                  : 'border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 dark:border-gray-700 dark:shadow-gray-900/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-semibold px-5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <FiStar size={12} /> {t('pricing.mostPopular')}
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1 dark:text-gray-100">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{plan.currency}</span>
                  <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{plan.price}</span>
                  <span className="text-gray-500 text-sm dark:text-gray-400">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3.5 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <FiCheck className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to={isAuthenticated ? '/payment' : '/register'}
                className={`block text-center py-3.5 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-lg hover:shadow-primary-500/30'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {isAuthenticated ? t('pricing.subscribeNow') : t('pricing.getStarted')}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
