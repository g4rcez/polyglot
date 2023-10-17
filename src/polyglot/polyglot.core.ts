import React from "react";
import { CurrencyCode, getCurrency } from "~/polyglot/locale-currency";
import { Locales } from "~/polyglot/locales";
import { Unit } from "~/polyglot/unit";

type Label = string | React.ReactElement | React.ReactNode;

type DateFormat = Partial<{
  day: "numeric" | "2-digit";
  era: "long" | "short" | "narrow";
  formatMatcher: "best fit" | "basic";
  hour12: boolean;
  hour: "numeric" | "2-digit";
  localeMatcher: "best fit" | "lookup";
  minute: "numeric" | "2-digit";
  month: "numeric" | "2-digit" | "long" | "short" | "narrow";
  second: "numeric" | "2-digit";
  timeZone: string;
  timeZoneName: "short" | "long" | "shortOffset" | "longOffset" | "shortGeneric" | "longGeneric";
  weekday: "long" | "short" | "narrow";
  year: "numeric" | "2-digit";
}>;

type NumberFormat = Partial<{
  currency: string;
  currencySign: string;
  localeMatcher: string;
  maximumFractionDigits: number;
  maximumSignificantDigits: number;
  minimumFractionDigits: number;
  minimumIntegerDigits: number;
  minimumSignificantDigits: number;
  useGrouping: boolean;
}>;

type PolyglotConfig = Partial<{
  date: DateFormat;
  datetime: DateFormat;
  money: NumberFormat;
  number: NumberFormat;
  percent: NumberFormat;
  time: DateFormat;
  unit: Omit<NumberFormat, "currency" | "currencySign"> & {
    type: Unit;
    display?: "short" | "long" | "narrow";
  };
  currency: Omit<NumberFormat, "currency" | "currencySign"> &
    Partial<{
      code: CurrencyCode;
      sign: "accounting" | "standard";
      display: "code" | "symbol" | "narrowSymbol" | "name";
    }>;
}>;

export type PolyglotFullConfig = PolyglotConfig & { languages?: Partial<Record<Locales, PolyglotConfig>> };

type GenericTranslationFn = (props: any, options?: PolyglotFullConfig) => any;

type TranslationMap = Record<string, Label | GenericTranslationFn>;

export const createPolyglotNative = <Locale extends Locales, Map extends (formatters: Formatters) => TranslationMap>(
  language: Locale,
  map: Map
) => ({ map, language }) as const;

export type InferTranslationMap<Config extends ReturnType<typeof createPolyglotNative>> = (
  formatters: Formatters
) => ReturnType<Config["map"]>;

const createFormatters = (lang: string, options?: PolyglotConfig) => ({
  date: new Intl.DateTimeFormat(lang).format,
  time: new Intl.DateTimeFormat(lang, {
    hour: "numeric",
    minute: "numeric",
    ...options?.time,
  }).format,
  datetime: new Intl.DateTimeFormat(lang, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    ...options?.datetime,
  }).format,
  number: new Intl.NumberFormat(lang, options?.number).format,
  unit: (unit: Unit, n: number) => new Intl.NumberFormat(lang, { unit, style: "unit", ...options?.unit }).format(n),
  percent: new Intl.NumberFormat(lang, { style: "percent", ...options?.percent }).format,
  money: new Intl.NumberFormat(lang, {
    style: "currency",
    currency: getCurrency(lang) as string,
    ...options?.money,
  }).format,
});

type Formatters = {
  [K in keyof ReturnType<typeof createFormatters>]: ReturnType<typeof createFormatters>[K];
};

const has = <T extends {}, K extends keyof T>(o: T, k: K | string): k is K =>
  Object.prototype.hasOwnProperty.call(o, k);

export const createPolyglot = <
  Config extends ReturnType<typeof createPolyglotNative>,
  Translations extends Partial<
    Record<
      Locales,
      | (() => Promise<{ default: (formatters: Formatters) => ReturnType<Config["map"]> }>)
      | ((formatters: Formatters) => ReturnType<Config["map"]>)
    >
  >,
>(
  initialConfig: Config,
  translations?: Translations,
  options: PolyglotFullConfig = {}
) => {
  type LanguageMap = ReturnType<Config["map"]>;
  type DefaultLanguage = Config["language"];
  type Languages = keyof Translations | DefaultLanguage;

  const defaultFormatters = createFormatters(initialConfig.language, options);

  const defaultMap: TranslationMap = initialConfig.map(defaultFormatters);

  const defaultLanguage: Languages = initialConfig.language;

  const config = {
    format: defaultFormatters,
    language: defaultLanguage as keyof Translations | DefaultLanguage,
    map: defaultMap,
  };

  const alias = Object.keys(config.map).reduce<{ [K in keyof LanguageMap]: K }>(
    (acc, el) => ({
      ...acc,
      [el]: el,
    }),
    {} as any
  );

  const fetchLanguage = async (newLanguage: Languages, extraOptions?: PolyglotConfig) => {
    const { languages } = options;
    const formatters = createFormatters(newLanguage as string, {
      ...options,
      ...languages?.[newLanguage],
      ...extraOptions,
    });
    const result =
      newLanguage === initialConfig.language ? defaultMap : await (translations?.[newLanguage] as any)?.(formatters);
    if (typeof result === "function") return { format: formatters, map: result(formatters) };
    const map = result?.default ? result.default(formatters) : result;
    return { map, format: formatters };
  };

  const getFromLanguageMap = async <Language extends Locales, V extends keyof LanguageMap>(
    language: Language,
    key: V,
    props: LanguageMap[V] extends GenericTranslationFn ? Parameters<LanguageMap[V]>[0] : null,
    options?: PolyglotFullConfig
  ) => {
    if (language === initialConfig.language) {
      const prop = config.map[key as string];
      return typeof prop === "function" ? prop(props, options) : prop;
    }
    const result = await fetchLanguage(language, options);
    const prop = result.map[key as string];
    return typeof prop === "function" ? prop(props) : prop;
  };

  const get = <V extends keyof LanguageMap>(
    key: V,
    props: LanguageMap[V] extends GenericTranslationFn ? Parameters<LanguageMap[V]>[0] : null,
    options?: PolyglotFullConfig
  ) => {
    if (config.language === initialConfig.language) {
      const prop = config.map[key as string];
      return typeof prop === "function" ? prop(props, options) : prop;
    }
    const prop = config.map[key as string];
    return typeof prop === "function" ? prop(props) : prop;
  };

  const setLanguage = async (newLanguage: keyof Translations | DefaultLanguage, extraOptions?: PolyglotFullConfig) => {
    if (newLanguage !== initialConfig.language && !has(translations || {}, newLanguage as string)) {
      throw new Error("Language not found");
    }
    const result = await fetchLanguage(newLanguage, extraOptions);
    config.language = newLanguage;
    config.format = result.format;
    config.map = result.map;
    return config;
  };

  return {
    ...config.format,
    alias,
    map: config.map,
    format: config.format,
    get,
    getFromLanguageMap,
    setLanguage,
    get language() {
      return config.language;
    },
  };
};

export type InferLanguages<Config extends ReturnType<typeof createPolyglot<any, any>>> = NonNullable<
  Parameters<Config["setLanguage"]>[0]
>;
