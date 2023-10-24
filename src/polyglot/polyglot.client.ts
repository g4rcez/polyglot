import { createGlobalReducer } from "use-typed-reducer";
import { createPolyglot, InferLanguages } from "~/polyglot/polyglot.core";
import { PolyglotFullConfig } from "~/polyglot/types/types";

export const createPolyglotStore = <Config extends ReturnType<typeof createPolyglot<any, any>>>(config: Config) =>
  createGlobalReducer(
    {
      format: config.format,
      language: config.language,
      map: config.map,
    },
    () => ({
      set: async (newLanguage: InferLanguages<Config>, extraOptions?: PolyglotFullConfig) => {
        const result = await config.setLanguage(newLanguage, extraOptions);
        return { map: result.map as any, language: newLanguage, format: result.format };
      },
    })
  );
