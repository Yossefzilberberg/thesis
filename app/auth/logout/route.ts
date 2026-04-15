import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  if (supabase) await supabase.auth.signOut();
  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/", url.origin), { status: 303 });
}

// Allow GET for simple link-based logout.
export async function GET(request: Request) {
  return POST(request);
}
