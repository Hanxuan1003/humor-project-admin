export default function AccessDeniedPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
                <h1 className="text-3xl font-bold text-slate-900">Access Denied</h1>
                <p className="mt-3 text-slate-600">
                    You are logged in, but your account is not a superadmin.
                </p>
            </div>
        </main>
    )
}