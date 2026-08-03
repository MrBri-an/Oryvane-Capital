import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const supabase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321");
  const isDevelopment = process.env.NODE_ENV === "development";
  const requestHeaders = new Headers(request.headers);
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' ${isDevelopment ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self' ${supabase.origin} ${supabase.origin.replace("https:", "wss:")}${isDevelopment ? " ws://127.0.0.1:* ws://localhost:*" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(!isDevelopment ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  return updateSession(request, requestHeaders).then((response) => {
    response.headers.set("Content-Security-Policy", csp);
    return response;
  });
}

export const config = {
  matcher: [{
    source: "/((?!api(?:/|$)|_next/static(?:/|$)|_next/image(?:/|$)|uploads(?:/|$)|assets(?:/|$)|favicon\\.ico$|icon(?:-[^/]+)?\\.(?:ico|png|svg)$|apple-icon(?:-[^/]+)?\\.(?:png|svg)$|robots\\.txt$|sitemap(?:-[^/]+)?\\.xml$|.*\\.(?:avif|css|gif|ico|jpe?g|js|map|otf|pdf|png|svg|ttf|txt|webmanifest|webp|woff2?)$).*)",
    missing: [
      { type: "header", key: "next-router-prefetch" },
      { type: "header", key: "purpose", value: "prefetch" },
    ],
  }],
};
