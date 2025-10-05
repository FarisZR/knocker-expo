type TranslationParams = Record<string, string | number>;

type TranslationMap = Record<string, string>;

const translations: TranslationMap = {
  'background.success': 'Background knock succeeded',
  'background.body': '{{whitelistedEntry}} – {{expiry}}',
  'background.expiresIn': 'Expires in {{seconds}} seconds',
  'background.expiryUnknown': 'Expiry unknown',
  'background.disable': 'Stop background knocks',
};

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/{{(\w+)}}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key];
      return value != null ? String(value) : '';
    }
    return match;
  });
}

function warnMissingTranslation(key: string) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(`[i18n] Missing translation for key "${key}"`);
  }
}

export function t(key: string, params?: TranslationParams): string {
  const template = translations[key];
  if (!template) {
    warnMissingTranslation(key);
    return key;
  }

  return interpolate(template, params);
}
