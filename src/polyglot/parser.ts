import { Datetime } from "~/polyglot/formatters/datetime";
import { Lists } from "~/polyglot/formatters/lists";
import { Numbers } from "~/polyglot/formatters/numbers";
import { noop } from "~/polyglot/lib";
import { PolyglotConfig } from "~/polyglot/types/types";
import { Unit } from "~/polyglot/types/unit";

export const createFormatters = (lang: string, options?: PolyglotConfig) => {
  const formatters = {
    ...Datetime.formatters(lang, options),
    ...Numbers.formatters(lang, options),
    ...Lists.formatters(lang, options),
    cardinalPlural: new Intl.PluralRules(lang, { type: "cardinal" }).select,
    ordinalPlural: new Intl.PluralRules(lang, { type: "ordinal" }).select,
  };
  return new Proxy(formatters, {
    get: Numbers.unitProxyHandler(lang, options),
  }) as typeof formatters & Record<Unit, (n: number) => string>;
};

export type Formatters = {
  [K in keyof ReturnType<typeof createFormatters>]: ReturnType<typeof createFormatters>[K];
};

export const parse = <T extends string, Params extends object>(text: T, params: Params, formatters: Formatters) =>
  text
    .replace(/\{\{([^}]+)}}/gm, (original, match: string) => {
      const [variable, ...functions]: [variable: keyof Params, ...functions: Array<keyof Formatters>] = match
        .split("|")
        .map((x) => x.trim()) as never;
      if (!(variable in params)) return original as string;
      const value = params[variable] as string;
      return functions.length !== 0
        ? functions.reduce<string>((acc, fn) => ((formatters[fn] as Function) ?? noop)(acc), value)
        : value;
    })
    .normalize("NFKC");
