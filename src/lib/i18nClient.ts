'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from '../../public/locales/en/common.json';
import khCommon from '../../public/locales/kh/common.json';

// Load resources from public/locales
const resources = {
  en: { common: enCommon },
  kh: { common: khCommon },
};

// Initialize once on the client
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      defaultNS: 'common',
      ns: ['common'],
      react: { useSuspense: false },
    })
    .catch(() => {});
}

export default i18n;
