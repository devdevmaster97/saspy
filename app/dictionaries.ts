import 'server-only';

const dictionaries = {
  'pt-BR': () => import('../public/locales/pt-BR/common.json').then((module) => module.default),
  'es': () => import('../public/locales/es/common.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  if (locale in dictionaries) {
    return dictionaries[locale as keyof typeof dictionaries]();
  }
  return dictionaries['pt-BR']();
}; 