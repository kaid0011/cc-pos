import { createI18n } from 'vue-i18n';

// Import translation files
import en from './locales/en.json';
import zh from './locales/zh.json';

// Define the messages
const messages = {
  en,
  zh
};

// Create the i18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: 'en', // Set default locale
  fallbackLocale: 'en', // Set fallback locale
  messages
});

export default i18n;
