import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SocialLinks from './SocialLinks';

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="min-w-0">
            <div className="mb-4">
              <img src="/logo.png" alt="Road Rules Academy" className="h-28 w-auto max-w-full object-contain shrink-0" />
            </div>
            <p className="text-sm text-gray-400">
              {t('footer.description')}
            </p>
          </div>

          <div className="min-w-0">
            <h3 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-white transition-colors">{t('footer.home')}</Link></li>
              <li><Link to="/library" className="text-sm hover:text-white transition-colors">{t('footer.library')}</Link></li>
              <li><Link to="/videos" className="text-sm hover:text-white transition-colors">{t('footer.videos')}</Link></li>
              <li><Link to="/about" className="text-sm hover:text-white transition-colors">{t('footer.aboutUs')}</Link></li>
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className="text-white font-semibold mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-sm hover:text-white transition-colors">{t('footer.contactUs')}</Link></li>
              <li><Link to="/faq" className="text-sm hover:text-white transition-colors">{t('footer.faq')}</Link></li>
              <li><span className="text-sm">{t('footer.privacyPolicy')}</span></li>
              <li><span className="text-sm">{t('footer.termsOfService')}</span></li>
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className="text-white font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2 text-sm">
              <li>{t('footer.location')}</li>
              <li>{t('footer.email')}</li>
              <li>{t('footer.phone')}</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <SocialLinks iconSize={22} spacing="gap-4" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
