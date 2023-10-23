import React from "react";
import { Locales } from "~/polyglot/locales";
import { createFormatters, Formatters, parse } from "~/polyglot/parser";
import { PolyglotConfig, PolyglotFullConfig } from "~/polyglot/types";

type Label = string | React.ReactElement | React.ReactNode;

type GenericTranslationFn = (props: any, options?: PolyglotFullConfig) => any;

type TranslationMap = Record<string, Label | GenericTranslationFn>;

export const createPolyglotNative = <Locale extends Locales, Map extends (formatters: Formatters) => TranslationMap>(
  language: Locale,
  map: Map
) => ({ map, language }) as const;

export type InferNativeLanguage<Config extends ReturnType<typeof createPolyglotNative>> = (
  formatters: Formatters
) => ReturnType<Config["map"]>;

const has = <T extends {}, K extends keyof T | string>(o: T, k: K | string): k is K =>
  Object.prototype.hasOwnProperty.call(o, k);

const createCompare = (locale: string) => new Intl.Collator(locale, {});

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
  type Comparator = ReturnType<typeof createCompare>;
  type AcceptedLanguages = keyof Translations | DefaultLanguage;
  type Formatters = ReturnType<typeof createFormatters>;

  const defaultFormatters = createFormatters(initialConfig.language, options);

  const defaultMap: TranslationMap = initialConfig.map(defaultFormatters);

  const defaultLanguage: AcceptedLanguages = initialConfig.language;

  const cache = new Map<
    AcceptedLanguages,
    {
      language: keyof Translations | DefaultLanguage;
      map: TranslationMap;
      compare: Comparator;
      format: Formatters;
    }
  >();

  const config = {
    compare: createCompare(defaultLanguage),
    format: defaultFormatters,
    language: defaultLanguage,
    map: defaultMap,
  };

  const setCachedConfig = (
    language: AcceptedLanguages,
    comparator: Comparator,
    format: Formatters,
    map: TranslationMap
  ) => {
    const result = { map, compare: comparator, format, language };
    cache.set(language, result);
    return result;
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
    ...[language, key, props, options]: LanguageMap[V] extends GenericTranslationFn
      ? [language: Language, key: V, props: Parameters<LanguageMap[V]>[0], options?: PolyglotFullConfig]
      : [language: Language, key: V, options?: PolyglotFullConfig]
  ) => {
    if (language === initialConfig.language) {
      const prop = config.map[key as string];
      return typeof prop === "function" ? prop(props, options) : prop;
    }
    const result = await fetchLanguage(language, options);
    const prop = result.map[key as string];
    return typeof prop === "function" ? prop(props) : prop;
  };

  const getFromMap =
    (conf: (typeof config)["map"]) =>
    <V extends keyof LanguageMap>(
      ...[key, props, options]: LanguageMap[V] extends GenericTranslationFn
        ? [key: V, props: Parameters<LanguageMap[V]>[0], options?: PolyglotFullConfig]
        : [key: V, options?: PolyglotFullConfig]
    ): string => {
      if (has(conf, key as string)) {
        const prop = conf[key as string];
        return parse(typeof prop === "function" ? prop(props, options) : prop, props ?? {}, config.format);
      }
      if (options?.fallback) {
        const prop = conf[options.fallback];
        return parse(typeof prop === "function" ? prop(props, options) : prop, props ?? {}, config.format);
      }
      throw new Error(`Property ${key as string} not exist in`, conf);
    };

  const createLanguage = async (
    newLanguage: keyof Translations | DefaultLanguage,
    extraOptions?: PolyglotFullConfig
  ) => {
    if (newLanguage !== initialConfig.language && !has(translations || {}, newLanguage as string)) {
      throw new Error("Language not found");
    }
    const cached = cache.get(newLanguage);
    if (cached !== undefined) return cached;
    const result = await fetchLanguage(newLanguage, extraOptions);
    return setCachedConfig(newLanguage, createCompare(newLanguage as string), result.format, result.map);
  };

  const get = <V extends keyof LanguageMap>(
    ...[key, props, options]: LanguageMap[V] extends GenericTranslationFn
      ? [key: V, props: Parameters<LanguageMap[V]>[0], options?: PolyglotFullConfig]
      : [key: V, options?: PolyglotFullConfig]
  ) => getFromMap(config.map)(key as any, props, options);

  const setLanguage = async (newLanguage: keyof Translations | DefaultLanguage, extraOptions?: PolyglotFullConfig) => {
    if (newLanguage !== initialConfig.language && !has(translations || {}, newLanguage as string)) {
      throw new Error("Language not found");
    }
    const result = await fetchLanguage(newLanguage, extraOptions);
    config.language = newLanguage;
    config.format = result.format;
    config.map = result.map;
    config.compare = createCompare(newLanguage as string);
    return config;
  };

  return {
    alias,
    createLanguage,
    compare: config.compare,
    format: config.format,
    get,
    parse: <P extends object>(text: string, params: P) => parse(text, params, config.format),
    getFromLanguageMap,
    map: config.map,
    setLanguage,
    get language() {
      return config.language;
    },
  };
};

export type InferLanguages<Config extends ReturnType<typeof createPolyglot<any, any>>> = NonNullable<
  Parameters<Config["setLanguage"]>[0]
>;
