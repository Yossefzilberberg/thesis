"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { APP_VERSION, BUILD_MESSAGE, BUILD_REF, SHORT_SHA, formatBuildTime, versionLabel } from "@/lib/version";

type NavItem = { href: string; label: string; desc?: string };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/new", label: "New thesis" },
  { href: "/handbook", label: "Handbook" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, configured, signOut } = useAuth();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-ink-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-serif text-lg font-semibold text-ink-900">
            <span className="inline-block h-2 w-2 rounded-full bg-accent-500" />
            Thesis Forge
            <span
              className="ml-2 hidden rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 font-mono text-[10px] font-normal text-ink-600 sm:inline"
              title={BUILD_MESSAGE || "Build version"}
            >
              v{APP_VERSION}
              {SHORT_SHA ? ` · ${SHORT_SHA}` : ""}
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition",
                  pathname?.startsWith(item.href)
                    ? "bg-ink-100 text-ink-900"
                    : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                )}
              >
                {item.label}
              </Link>
            ))}
            {configured && (
              <div className="ml-2 flex items-center gap-1 border-l border-ink-200 pl-2">
                {user ? (
                  <>
                    <span className="hidden text-xs text-ink-500 sm:inline" title={user.email ?? ""}>
                      {user.email}
                    </span>
                    <button
                      onClick={() => void signOut()}
                      className="rounded-md px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="rounded-md bg-ink-900 px-3 py-1.5 text-sm text-white hover:bg-ink-800"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-ink-200 py-6 text-center text-xs text-ink-500">
        <div>A research advisor, not a ghost-writer. Your work, disciplined end-to-end.</div>
        <div
          className="mt-1 font-mono text-[10px] text-ink-400"
          title={BUILD_MESSAGE || "Build info"}
        >
          {versionLabel()}
          {BUILD_REF && BUILD_REF !== "main" ? ` · ${BUILD_REF}` : ""}
          {formatBuildTime() ? "" : " · dev"}
        </div>
      </footer>
    </div>
  );
}
