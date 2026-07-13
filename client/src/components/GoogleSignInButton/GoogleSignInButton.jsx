import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

function GoogleSignInButton({ mode = 'login' }) {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/dashboard';

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        await googleLogin(tokenResponse.access_token);
        navigate(redirect);
      } catch (error) {
        toast.error(error.response?.data?.message || t('login.googleLoginFailed') || 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error(t('login.googleLoginFailed') || 'Google sign-in failed');
      setLoading(false);
    },
    onNonOAuthError: () => {
      setLoading(false);
    },
    flow: 'implicit',
  });

  return (
    <button
      onClick={() => login()}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700 dark:text-gray-200"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
      ) : (
        <FcGoogle size={20} />
      )}
      {loading
        ? t('login.signingIn') || 'Signing in...'
        : mode === 'login'
          ? t('login.continueWithGoogle') || 'Continue with Google'
          : t('register.signUpWithGoogle') || 'Sign up with Google'}
    </button>
  );
}

export default GoogleSignInButton;
