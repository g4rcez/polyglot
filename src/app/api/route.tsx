import { NextResponse } from "next/server";
import { i18n, Languages } from "~/i18n/i18n.core";

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const language: Languages = (url.searchParams.get("language") as never) || "pt-BR";
  await i18n.setLanguage(language as any);
  return NextResponse.json({
    message: i18n.get("welcome", null),
  });
};
