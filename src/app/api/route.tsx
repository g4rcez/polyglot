import { NextResponse } from "next/server";
import { i18n, Languages } from "~/i18n/i18n.core";

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const language: Languages = (url.searchParams.get("language") as never) || "pt-BR";
  const result = await i18n.createLanguage(language as any);
  return NextResponse.json({ message: result.get("welcome") });
};
