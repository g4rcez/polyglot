"use client";
import { useLanguage } from "~/i18n/i18n.client";
import { i18n } from "~/i18n/i18n.core";

export default function Home() {
  const [state, dispatch] = useLanguage();

  return (
    <div className="flex gap-8 flex-col items-center justify-center align-middle h-screen w-full">
      <button className="px-4 py-2 bg-blue-400 rounded" onClick={() => dispatch.set("en-US")}>
        Change to en-us
      </button>
      <button className="px-4 py-2 bg-emerald-400 rounded" onClick={() => dispatch.set("pt-BR")}>
        Mudar para PT-BR
      </button>
      <pre>
        <code>{state.language}</code>
      </pre>
      <ul>
        <li>count: {i18n.get("count")}</li>
        <li>hello: {i18n.get(i18n.alias.hello, { fulano: "Fulano" })}</li>
        <li>welcome: {i18n.get("welcome")}</li>
        <li>unit: {i18n.get(i18n.alias.unit, { temp: 32 })}</li>
      </ul>
    </div>
  );
}
