import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { usePayment } from '../../context/PaymentContext';
import PaymentCard from '../../components/PaymentCard/PaymentCard';
import toast from 'react-hot-toast';

function Payment() {
  const { t } = useTranslation();

  const plans = [
    { id: 'monthly', name: t('payment.plans.monthly.name'), price: '25,000', period: t('payment.plans.monthly.period') },
    { id: 'quarterly', name: t('payment.plans.quarterly.name'), price: '60,000', period: t('payment.plans.quarterly.period'), popular: true },
    { id: 'yearly', name: t('payment.plans.yearly.name'), price: '200,000', period: t('payment.plans.yearly.period') },
  ];

  const paymentMethods = [
    { method: 'mtn_momo', icon: '📱', name: t('payment.methods.mtn.name'), description: t('payment.methods.mtn.desc') },
    { method: 'airtel_money', icon: '📱', name: t('payment.methods.airtel.name'), description: t('payment.methods.airtel.desc') },
    { method: 'visa', icon: '💳', name: t('payment.methods.visa.name'), description: t('payment.methods.visa.desc') },
    { method: 'mastercard', icon: '💳', name: t('payment.methods.mastercard.name'), description: t('payment.methods.mastercard.desc') },
  ];

  const [selectedPlan, setSelectedPlan] = useState('quarterly');
  const [selectedMethod, setSelectedMethod] = useState('mtn_momo');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const { initiatePayment, hasActiveSubscription } = usePayment();

  const handlePayment = async () => {
    if (!phone && (selectedMethod === 'mtn_momo' || selectedMethod === 'airtel_money')) {
      toast.error(t('payment.enterPhone'));
      return;
    }
    setProcessing(true);
    try {
      const txId = 'TXN' + Date.now();
      await initiatePayment(selectedPlan, selectedMethod, txId);
      toast.success(t('payment.paymentInitiated'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('payment.paymentFailed'));
    } finally {
      setProcessing(false);
    }
  };

  if (hasActiveSubscription) {
    return (
      <>
        <Helmet><title>{t('payment.pageTitle')}</title></Helmet>
        <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
          <div className="dash-card p-12">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('payment.hasSubscription')}</h1>
            <p style={{ color: 'rgb(var(--text-secondary))' }}>{t('payment.hasSubscriptionDesc')}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>{t('payment.pageTitle')}</title></Helmet>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'rgb(var(--text-primary))' }}>{t('payment.title')}</h1>
          <p style={{ color: 'rgb(var(--text-secondary))' }}>{t('payment.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-stagger">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`dash-card relative cursor-pointer transition-all duration-200 p-6 ${
                selectedPlan === plan.id
                  ? 'ring-2 ring-primary-500 border-primary-500'
                  : 'hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full shadow-sm">
                  {t('pricing.bestValue')}
                </span>
              )}
              <div className="flex items-center justify-center w-10 h-10 rounded-lg mb-4 mx-auto"
                style={{ background: selectedPlan === plan.id ? 'rgb(var(--primary-500, 99 102 241) / 0.1)' : 'rgb(var(--surface-elevated))' }}>
                {plan.id === 'monthly' && (
                  <svg className="w-5 h-5" style={{ color: selectedPlan === plan.id ? 'rgb(var(--text-primary))' : 'rgb(var(--text-tertiary))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {plan.id === 'quarterly' && (
                  <svg className="w-5 h-5" style={{ color: selectedPlan === plan.id ? 'rgb(var(--text-primary))' : 'rgb(var(--text-tertiary))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {plan.id === 'yearly' && (
                  <svg className="w-5 h-5" style={{ color: selectedPlan === plan.id ? 'rgb(var(--text-primary))' : 'rgb(var(--text-tertiary))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <h3 className="font-semibold text-center" style={{ color: 'rgb(var(--text-primary))' }}>{plan.name}</h3>
              <p className="text-2xl font-bold text-center mt-2" style={{ color: 'rgb(var(--text-primary))' }}>UGX {plan.price}</p>
              <p className="text-sm text-center mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>{plan.period}</p>
              {selectedPlan === plan.id && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mb-6 animate-slide-up">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>{t('payment.paymentMethod')}</h2>
          <div className="space-y-3">
            {paymentMethods.map((pm) => (
              <PaymentCard key={pm.method} {...pm} selected={selectedMethod === pm.method} onSelect={setSelectedMethod} />
            ))}
          </div>
        </div>

        {(selectedMethod === 'mtn_momo' || selectedMethod === 'airtel_money') && (
          <div className="mb-6 animate-slide-up">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>{t('payment.phoneNumber')}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('payment.phonePlaceholder')}
              className="dash-input"
            />
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={processing}
          className="btn-primary w-full py-3.5 text-base"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('payment.processing')}
            </span>
          ) : t('payment.payBtn', { price: plans.find(p => p.id === selectedPlan)?.price })}
        </button>
      </div>
    </>
  );
}

export default Payment;
