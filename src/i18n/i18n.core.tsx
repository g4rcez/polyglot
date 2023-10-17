import { createPolyglot, createPolyglotNative, InferLanguages, InferTranslationMap } from "~/polyglot/polyglot.core";

export const defaultMap = createPolyglotNative("pt-BR", (f) => ({
  welcome: "Olá mundo",
  count: `O número ${f.number(100_000)} se pronuncia cem mil`,
  hello: (props: { fulano: string }) => `Olá ${props.fulano}`,
  unit: (props: { celsius: number }) => `Temperatura ${f.unit("celsius",props.celsius)}`,
}));

export type TranslationMap = InferTranslationMap<typeof defaultMap>;

export const i18n = createPolyglot(defaultMap, {
  "en-US": () => import("./en-us"),
});

export type Languages = InferLanguages<typeof i18n>;
