import { FiDownload, FiExternalLink } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import apiUrl from '../../utils/apiUrl';

function CertificateCard({ certificate }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900/50">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center dark:bg-amber-950">
          <span className="text-2xl">🏆</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{certificate.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">#{certificate.certificate_number}</p>
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-4 dark:text-gray-300">
        <p>{t('certificateCard.issued', { date: new Date(certificate.issue_date).toLocaleDateString() })}</p>
        {certificate.expiry_date && (
          <p>{t('certificateCard.expires', { date: new Date(certificate.expiry_date).toLocaleDateString() })}</p>
        )}
      </div>
      <div className="flex gap-2">
        {certificate.file_url && (
          <a href={apiUrl(certificate.file_url)} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-sm text-primary-600 hover:underline">
            <FiDownload size={16} /> {t('certificateCard.download')}
          </a>
        )}
        <span
          className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500">
          <FiExternalLink size={16} /> {t('certificateCard.verify')}
        </span>
      </div>
    </div>
  );
}

export default CertificateCard;
