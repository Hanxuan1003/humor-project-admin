import LoginButton from "./login-button"

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
                <p className="mt-2 text-slate-600">
                    Sign in with Google to continue to the admin area.
                </p>

                <div className="mt-6">
                    <LoginButton />
                </div>
            </div>
        </main>
    )
}