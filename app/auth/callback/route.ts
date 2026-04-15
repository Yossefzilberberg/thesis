import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// OAuth / magic link callback. Supabase sends the user here with a
// `code` query param; we exchange it for a session cookie and redirect
// them to the originally requested page (or the dashboard).

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await getSupabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, url.origin));
      }
    }
  }
  return NextResponse.redirect(new URL("/auth/login?error=callback", url.origin));
}
