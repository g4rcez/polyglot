import { i18n } from "~/i18n/i18n.core";
import { createPolyglotStore } from "~/polyglot/polyglot.client";

export const useLanguage = createPolyglotStore(i18n);
