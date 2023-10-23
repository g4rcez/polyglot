import { getCurrency } from "~/polyglot/locale-currency";
import { PolyglotConfig } from "~/polyglot/types";
import { Unit } from "~/polyglot/unit";

export const createFormatters = (lang: string, options?: PolyglotConfig) => {
  const formatters = {
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
    percent: new Intl.NumberFormat(lang, { style: "percent", ...options?.percent }).format,
    relative: new Intl.RelativeTimeFormat(lang, { style: "long", localeMatcher: "lookup" }).format,
    and: new Intl.ListFormat(lang, { style: "long", localeMatcher: "lookup", type: "conjunction" }).format,
    or: new Intl.ListFormat(lang, { style: "long", localeMatcher: "lookup", type: "disjunction" }).format,
    listUnit: new Intl.ListFormat(lang, { style: "long", localeMatcher: "lookup", type: "unit" }).format,
    cardinalPlural: new Intl.PluralRules(lang, { type: "cardinal" }).select,
    ordinalPlural: new Intl.PluralRules(lang, { type: "ordinal" }).select,
    money: new Intl.NumberFormat(lang, {
      style: "currency",
      currency: getCurrency(lang) as string,
      ...options?.money,
    }).format,
  };
  return new Proxy(formatters, {
    get(target: any, p: string | symbol) {
      if (p in target) return target[p];
      try {
        const assign = new Intl.NumberFormat(lang, { unit: p as string, style: "unit", ...options?.unit }).format;
        target[p] = assign;
        return assign;
      } catch (e) {
        return undefined;
      }
    },
  }) as typeof formatters & Record<Unit, (n: number) => string>;
};

export type Formatters = {
  [K in keyof ReturnType<typeof createFormatters>]: ReturnType<typeof createFormatters>[K];
};

const noop = <T>(a: T): T => a;

export const parse = <T extends string, Params extends object>(text: T, params: Params, formatters: Formatters) =>
  text.replace(/\{\{([^}]+)}}/gm, (original, match: string) => {
    const [variable, ...functions]: [variable: keyof Params, ...functions: Array<keyof Formatters>] = match
      .split("|")
      .map((x) => x.trim()) as never;
    if (!(variable in params)) return original as string;
    const value = params[variable] as string;
    return functions.length !== 0
      ? functions.reduce<string>((acc, fn) => ((formatters[fn] as Function) ?? noop)(acc), value)
      : value;
  });
