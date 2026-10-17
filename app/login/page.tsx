"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Create the client only in the browser (event handlers / effects), never during server rendering.
// createBrowserClient returns a cached singleton, so calling it repeatedly is cheap.
const supabase = () => createClient();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // If we already have a session, go straight to the dashboard
  useEffect(() => {
    supabase().auth.getSession().then(({ data }) => {
      if (data.session) router.push("/dashboard");
    });
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    router.push("/dashboard");
    router.refresh(); // re-render server components with the new session cookie
  }

  return (
    <>
      <h1>Log in</h1>
      <form className="card" onSubmit={onSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <button type="submit">Log in</button>
      </form>
    </>
  );
}
