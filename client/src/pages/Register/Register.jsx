import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function Register() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const password = form.password;
  const rules = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\?<>,.]/.test(password),
    length: password.length >= 5 && password.length <= 12,
  };
  const rulesMet = Object.values(rules).filter(Boolean).length;
  const strength = rulesMet <= 2 ? 'weak' : rulesMet <= 4 ? 'medium' : 'strong';
  const allRulesMet = Object.values(rules).every(Boolean);
  const passwordsMatch = password === form.confirmPassword;
  const confirmPasswordDirty = form.confirmPassword.length > 0;
  const isFormValid = form.full_name && form.email && password && allRulesMet && form.confirmPassword && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error(t('register.fillFields'));
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      navigate(redirect);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || t('register.registrationFailed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  const strengthBar = {
    weak: { width: '33.33%', bg: 'bg-red-500', label: t('register.weak') },
    medium: { width: '66.66%', bg: 'bg-yellow-500', label: t('register.medium') },
    strong: { width: '100%', bg: 'bg-green-500', label: t('register.strong') },
  };

  const checklistItems = [
    { key: 'uppercase', label: t('register.checkUppercase') },
    { key: 'lowercase', label: t('register.checkLowercase') },
    { key: 'number', label: t('register.checkNumber') },
    { key: 'special', label: t('register.checkSpecial') },
    { key: 'length', label: t('register.checkLength') },
  ];

  return (
    <>
      <Helmet><title>{t('register.pageTitle')}</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border p-6 sm:p-8">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Road Rules Academy" className="h-52 w-auto max-w-full object-contain mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('register.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('register.subtitle')}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('register.fullName')}</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('register.email')}</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('register.phone')}</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('register.password')}</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {password && (
                <>
                  <div className="mt-2 space-y-1">
                    {checklistItems.map((item) => (
                      <p key={item.key} className={`text-xs ${rules[item.key] ? 'text-green-600' : 'text-red-600'}`}>
                        {rules[item.key] ? '✅' : '❌'} {item.label}
                      </p>
                    ))}
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${strengthBar[strength].bg}`}
                        style={{ width: strengthBar[strength].width }} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('register.passwordStrength')} <span className="font-semibold">{strengthBar[strength].label}</span>
                    </p>
                  </div>
                </>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('register.confirmPassword')}</label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {confirmPasswordDirty && (
                <p className={`text-sm mt-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordsMatch ? t('register.passwordsMatch') : t('register.passwordsDoNotMatch')}
                </p>
              )}
            </div>
            <button type="submit" disabled={loading || !isFormValid}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? t('register.creatingAccount') : t('register.registerBtn')}
            </button>
          </form>
          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            {t('register.hasAccount')} <Link to="/login" className="text-primary-600 hover:underline">{t('register.login')}</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;
