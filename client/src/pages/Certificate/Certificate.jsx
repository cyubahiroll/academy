import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import authService from '../../services/authService';
import CertificateCard from '../../components/CertificateCard/CertificateCard';

function Certificate() {
  const { t } = useTranslation();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const { data } = await axios.get('/api/certificates/my', {
        headers: { Authorization: `Bearer ${authService.getToken()}` }
      });
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>{t('certificate.pageTitle')}</title></Helmet>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'rgb(var(--text-primary))' }}>{t('certificate.title')}</h1>
          <p style={{ color: 'rgb(var(--text-secondary))' }}>{t('certificate.subtitle')}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'rgb(var(--border))', borderTopColor: 'rgb(var(--text-primary))' }} />
          </div>
        ) : certificates.length === 0 ? (
          <div className="dash-card p-16 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgb(var(--surface-elevated))' }}>
              <svg className="w-10 h-10" style={{ color: 'rgb(var(--text-tertiary))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.853m0 0l.003.003m0 0l.003-.003m-.003.003a6.019 6.019 0 01-2.776-.854m0 0a6.02 6.02 0 01-2.48-5.228" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('certificate.noCertificates')}</h3>
            <p style={{ color: 'rgb(var(--text-tertiary))' }}>{t('certificate.noCertificatesDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-stagger">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Certificate;
