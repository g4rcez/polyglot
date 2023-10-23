import { CurrencyCode } from "~/polyglot/locale-currency";
import { Locales } from "~/polyglot/locales";
import { Unit } from "~/polyglot/unit";

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

export type PolyglotConfig = Partial<{
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

export type PolyglotFullConfig = Partial<
  PolyglotConfig & {
    languages: Partial<Record<Locales, PolyglotConfig>>;
    fallback: string;
  }
>;
