import { useLanguage } from '../context/LanguageContext';
import { translations } from '../constants/Translations';

export const useTranslation = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return { t, language };
};

