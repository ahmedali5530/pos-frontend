import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import EnLang from './language/lang.en.json';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: EnLang
      }
    },
    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
    saveMissing: true,
    saveMissingTo: "current"
  });

export default i18n;
