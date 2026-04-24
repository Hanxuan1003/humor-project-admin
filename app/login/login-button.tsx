"use client"

import { createClient } from "@/lib/supabase/client"

export default function LoginButton() {
    const handleLogin = async () => {
        const supabase = createClient()

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
            },
        })
    }

    return (
        <button
            onClick={handleLogin}
            className="rounded-xl bg-slate-900 px-5 py-3 text-white hover:bg-slate-800"
        >
            Continue with Google
        </button>
    )
}