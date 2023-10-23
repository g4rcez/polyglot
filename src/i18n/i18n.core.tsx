import { createPolyglot, createPolyglotNative, InferLanguages, InferNativeLanguage } from "~/polyglot/polyglot.core";

export const defaultMap = createPolyglotNative("pt-BR", (f) => ({
  welcome: "Olá mundo",
  count: `O número ${f.number(100_000)} se pronuncia cem mil`,
  hello: (props: { fulano: string }) => `Olá ${props.fulano}`,
  unit: (props: { temp: number }) => `Temperatura {{temp|celsius}}`,
}));

export type TranslationMap = InferNativeLanguage<typeof defaultMap>;

export const i18n = createPolyglot(defaultMap, {
  "en-US": () => import("./en-us"),
});

export type Languages = InferLanguages<typeof i18n>;
