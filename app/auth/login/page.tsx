"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button, Card, Input, Label } from "@/components/ui/primitives";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  async function sendMagic() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setBusy(true);
    setErr(null);
    setInfo(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
              : undefined,
        },
      });
      if (error) throw error;
      setInfo("Check your inbox — we sent you a sign-in link.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not send link");
    } finally {
      setBusy(false);
    }
  }

  async function signInPassword() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setBusy(true);
    setErr(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(next);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  async function signUpPassword() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setBusy(true);
    setErr(null);
    setInfo(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
              : undefined,
        },
      });
      if (error) throw error;
      setInfo("Account created. Check your inbox to confirm, then sign in.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not sign up");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <Shell>
        <div className="mx-auto max-w-lg px-6 py-16">
          <Card>
            <h1 className="font-serif text-xl font-semibold text-ink-900">Cloud storage not configured</h1>
            <p className="mt-2 text-sm text-ink-700">
              Thesis Forge needs a Supabase project for cloud storage and
              authentication. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment
              (on Vercel: Project → Settings → Environment Variables), then
              redeploy.
            </p>
            <p className="mt-3 text-sm text-ink-700">
              Setup guide: <code>SUPABASE_SETUP.md</code> in the repository.
            </p>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-serif text-3xl font-semibold text-ink-900">Sign in</h1>
        <p className="mt-2 text-sm text-ink-600">
          Your theses are stored in the cloud and synced across your devices.
        </p>

        <div className="mt-6 flex gap-1 rounded-md border border-ink-200 bg-white p-1 text-xs">
          <button
            className={`flex-1 rounded-md px-3 py-1.5 ${mode === "magic" ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-50"}`}
            onClick={() => setMode("magic")}
          >
            Magic link
          </button>
          <button
            className={`flex-1 rounded-md px-3 py-1.5 ${mode === "password" ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-50"}`}
            onClick={() => setMode("password")}
          >
            Email + password
          </button>
        </div>

        <Card className="mt-4 space-y-3">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {mode === "password" && (
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}

          {mode === "magic" ? (
            <Button onClick={sendMagic} disabled={busy || !email.trim()} className="w-full">
              {busy ? "Sending…" : "Send sign-in link"}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={signInPassword} disabled={busy || !email || !password} className="flex-1">
                {busy ? "…" : "Sign in"}
              </Button>
              <Button
                variant="secondary"
                onClick={signUpPassword}
                disabled={busy || !email || password.length < 8}
                className="flex-1"
              >
                Create account
              </Button>
            </div>
          )}

          {info && <p className="text-xs text-green-700">{info}</p>}
          {err && <p className="text-xs text-red-600">{err}</p>}
        </Card>

        <p className="mt-4 text-center text-xs text-ink-500">
          <Link href="/" className="underline hover:text-ink-700">
            Back to home
          </Link>
        </p>
      </div>
    </Shell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
