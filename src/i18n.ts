import i18next, { TFunction } from 'i18next'
import { initReactI18next } from 'react-i18next'

interface LoadI18NextOptionsType {
  defaultLocale: string
  locales: string[]
  resources: {
    [key: string]: {
      main: { [key: string]: any }
    }
  }
}

interface LoadI18NextType {
  (opt: LoadI18NextOptionsType): Promise<TFunction>
}

const loadI18Next: LoadI18NextType = (opt) =>
  i18next.use(initReactI18next).init({
    fallbackLng: opt.defaultLocale,
    ns: ['main'],
    defaultNS: 'main',
    preload: opt.locales,
    resources: opt.resources,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

export default loadI18Next
