import type { TranslationMap } from "~/i18n/i18n.core";

const convertCToF = (c: number) => c * (9 / 5) + 32;

const enUsMap: TranslationMap = (f) => ({
  welcome: "Hello world",
  hello: (props) => `Hello ${props.fulano}`,
  count: `The pronunciation of number ${f.number(100_000)} is one hundred thousand`,
  unit: (p) => `Weather ${f.unit("fahrenheit", convertCToF(p.celsius))}`,
});

export default enUsMap;
