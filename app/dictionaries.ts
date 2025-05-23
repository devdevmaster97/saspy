import 'server-only';
import type { Locale } from './i18n-config';

const dictionaries = {
  'pt-BR': () => import('../public/locales/pt-BR/common.json').then((module) => module.default),
  'es': () => import('../public/locales/es/common.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  try {
    return await dictionaries[locale as keyof typeof dictionaries]();
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error);
    return dictionaries['pt-BR']();
  }
}; 