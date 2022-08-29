import i18n from "i18next";
import {initReactI18next} from "react-i18next";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      ar: {
        translation: require('./lang.ar.json')
      },
      en: {
        translation: require('./lang.en.json')
      }
    },
    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
    saveMissing: true,
    saveMissingTo: "current"
  });

export default i18n;
