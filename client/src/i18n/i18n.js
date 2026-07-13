import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import rw from './rw.json';
import fr from './fr.json';
import sw from './sw.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, rw: { translation: rw }, fr: { translation: fr }, sw: { translation: sw } },
    fallbackLng: 'en',
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'], lookupLocalStorage: 'i18nextLng' },
    interpolation: { escapeValue: false },
  });

export default i18n;
