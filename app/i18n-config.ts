export const i18n = {
  defaultLocale: 'pt-BR' as const,
  locales: ['pt-BR', 'es'] as const,
};

export type Locale = (typeof i18n)['locales'][number]; 