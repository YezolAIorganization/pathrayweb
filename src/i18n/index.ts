import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const en = {
  hero: {
    title: 'Know what you can afford before you apply.',
    sub: 'Tell us your goals and budget. Get a funding-first report with verified options in 48 hours.',
    cta: 'Start your free Quick Check',
  },
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
