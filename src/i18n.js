import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ms from './locales/ms.json';
import en from './locales/en.json';

const savedLanguage = localStorage.getItem('language') || 'ms';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ms: { translation: ms },
      en: { translation: en }
    },
    lng: savedLanguage,
    fallbackLng: 'ms',
    interpolation: {
      escapeValue: false
    }
  });

// Dengari penukaran bahasa untuk simpan ke localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
