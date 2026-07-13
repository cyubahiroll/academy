import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error(t('contact.fillFields'));
      return;
    }
    setSending(true);
    try {
      await axios.post('/api/contact', form);
      toast.success(t('contact.sentSuccess'));
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || t('contact.sendFailed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Helmet><title>{t('contact.pageTitle')}</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('contact.title')}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{t('contact.subtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('contact.name')}</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('contact.email')}</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('contact.message')}</label>
                <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
              </div>
              <button type="submit" disabled={sending}
                className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50">
                {sending ? t('contact.sending') : t('contact.sendBtn')}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <FiMail className="text-primary-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('contact.email')}</h3>
                <p className="text-gray-500 dark:text-gray-400">{t('contact.emailContact')}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <FiPhone className="text-primary-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Phone</h3>
                <p className="text-gray-500 dark:text-gray-400">{t('contact.phoneContact')}</p>

              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <FiMapPin className="text-primary-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Location</h3>
                <p className="text-gray-500 dark:text-gray-400">{t('contact.location')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Contact;
