import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import GoogleSignInButton from '../../components/GoogleSignInButton/GoogleSignInButton';

function Login() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error(t('login.fillFields'));
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(redirect);
    } catch (error) {
      toast.error(error.response?.data?.message || t('login.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>{t('login.pageTitle')}</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border p-6 sm:p-8">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Road Rules Academy" className="h-52 w-auto max-w-full object-contain mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('login.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('login.subtitle')}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('login.email')}</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('login.password')}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {loading ? t('login.loggingIn') : t('login.loginBtn')}
            </button>
          </form>
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-600"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-gray-800 text-gray-400">or</span></div>
            </div>
            <div className="mt-4">
              <GoogleSignInButton mode="login" />
            </div>
          </div>
          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            {t('login.noAccount')} <Link to={`/register?redirect=${redirect}`} className="text-primary-600 hover:underline">{t('login.signUp')}</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
