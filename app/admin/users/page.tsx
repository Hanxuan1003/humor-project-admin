import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

async function requireSuperAdmin() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("id", user.id)
        .single()

    if (!profile?.is_superadmin) {
        redirect("/access-denied")
    }

    return supabase
}

export default async function AdminUsersPage() {
    const supabase = await requireSuperAdmin()

    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, is_superadmin, created_datetime_utc")
        .order("created_datetime_utc", { ascending: false })
        .limit(50)

    if (error) {
        console.error("Error loading profiles:", error)
    }

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">Users / Profiles</h1>
                        <p className="mt-2 text-slate-600">
                            Read-only view of recent user profiles.
                        </p>
                    </div>

                    <Link
                        href="/admin"
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Email</th>
                            <th className="px-4 py-3 font-semibold">Name</th>
                            <th className="px-4 py-3 font-semibold">Superadmin</th>
                            <th className="px-4 py-3 font-semibold">Created</th>
                            <th className="px-4 py-3 font-semibold">ID</th>
                        </tr>
                        </thead>

                        <tbody>
                        {(profiles ?? []).map((profile) => (
                            <tr key={profile.id} className="border-t border-slate-200">
                                <td className="px-4 py-3 text-slate-900">
                                    {profile.email ?? "No email"}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {[profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
                                        "No name"}
                                </td>
                                <td className="px-4 py-3">
                                    {profile.is_superadmin ? (
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        TRUE
                      </span>
                                    ) : (
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        FALSE
                      </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {profile.created_datetime_utc
                                        ? new Date(profile.created_datetime_utc).toLocaleString()
                                        : "Unknown"}
                                </td>
                                <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-slate-500">
                                    {profile.id}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {(profiles ?? []).length === 0 && (
                        <div className="p-8 text-center text-slate-500">No profiles found.</div>
                    )}
                </div>
            </div>
        </main>
    )
}