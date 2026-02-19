import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import npTranslations from './locales/np.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      np: {
        translation: npTranslations,
      },
    },
    fallbackLng: 'np',
    lng: 'np',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;