import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationEN from "./locales/en/translationEN.json";
import translationVI from "./locales/vi/translationVI.json";

const resources = {
    en: {
        translation: translationEN,
    },
    vi: {
        translation: translationVI,
    },
};

i18next.use(initReactI18next).use(LanguageDetector).init({
    resources,
    fallbackLng: "en",
    // lng: "vi",
    // debug: true,
});
