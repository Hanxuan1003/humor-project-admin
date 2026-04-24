import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

async function requireSuperAdmin() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect("/login")

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

export default async function AdminCaptionsPage() {
    const supabase = await requireSuperAdmin()

    const { data: captions, error } = await supabase
        .from("captions")
        .select("*")
        .order("created_datetime_utc", { ascending: false })
        .limit(50)

    if (error) {
        console.error("Error loading captions:", error)
    }

    const rows = captions ?? []
    const columns = rows.length > 0 ? Object.keys(rows[0]).slice(0, 8) : []

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">Captions</h1>
                        <p className="mt-2 text-slate-600">
                            Read-only admin view of recent generated captions.
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
                            {columns.map((column) => (
                                <th key={column} className="px-4 py-3 font-semibold">
                                    {column}
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody>
                        {rows.map((caption: Record<string, unknown>) => (
                            <tr key={String(caption.id)} className="border-t border-slate-200 align-top">
                                {columns.map((column) => (
                                    <td
                                        key={column}
                                        className="max-w-xs truncate px-4 py-3 text-slate-700"
                                    >
                                        {String(caption[column] ?? "NULL")}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {rows.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No captions found.
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}