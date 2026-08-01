const allowedDestinations = new Set(["/dashboard", "/reset-password"]);

export function safeRedirectPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return fallback;
  const path = value.split(/[?#]/, 1)[0];
  return allowedDestinations.has(path) ? value : fallback;
}
