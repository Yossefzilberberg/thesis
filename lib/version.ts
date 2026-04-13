// Build-time version metadata surfaced to both server and client. Values
// are injected via `next.config.js` so they're baked into the bundle and
// change every deploy (Vercel sets VERCEL_GIT_COMMIT_SHA for every build).

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0";
export const BUILD_SHA = process.env.NEXT_PUBLIC_BUILD_SHA || "";
export const BUILD_REF = process.env.NEXT_PUBLIC_BUILD_REF || "";
export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME || "";
export const BUILD_MESSAGE = process.env.NEXT_PUBLIC_BUILD_MESSAGE || "";

export const SHORT_SHA = BUILD_SHA ? BUILD_SHA.slice(0, 7) : "";

export function formatBuildTime(): string {
  if (!BUILD_TIME) return "";
  try {
    const d = new Date(BUILD_TIME);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return BUILD_TIME;
  }
}

export function versionLabel(): string {
  const parts = [`v${APP_VERSION}`];
  if (SHORT_SHA) parts.push(SHORT_SHA);
  const when = formatBuildTime();
  if (when) parts.push(when);
  return parts.join(" · ");
}
