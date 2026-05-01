import Link from "next/link"
import { redirect } from "next/navigation"
import { requireSuperAdmin } from "@/lib/admin/require-superadmin"

async function createDomain(formData: FormData) {
    "use server"

    const apex_domain = String(formData.get("apex_domain") ?? "").trim()

    if (!apex_domain) {
        redirect("/admin/allowed-signup-domains")
    }

    const supabase = await requireSuperAdmin()

    await supabase.from("allowed_signup_domains").insert({
        apex_domain,
    })

    redirect("/admin/allowed-signup-domains")
}

async function deleteDomain(formData: FormData) {
    "use server"

    const id = Number(formData.get("id"))
    const supabase = await requireSuperAdmin()

    await supabase.from("allowed_signup_domains").delete().eq("id", id)

    redirect("/admin/allowed-signup-domains")
}

export default async function AllowedSignupDomainsPage() {
    const supabase = await requireSuperAdmin()

    const { data: domains, error } = await supabase
        .from("allowed_signup_domains")
        .select("id, apex_domain, created_datetime_utc, modified_datetime_utc")
        .order("created_datetime_utc", { ascending: false })

    if (error) {
        console.error("Error loading allowed signup domains:", error)
    }

    const rows = domains ?? []

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">
                            Allowed Signup Domains
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Create, read, and delete allowed signup domains.
                        </p>
                    </div>

                    <Link
                        href="/admin"
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                <form
                    action={createDomain}
                    className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <h2 className="text-xl font-bold text-slate-900">Add Domain</h2>

                    <div className="mt-4 flex gap-3">
                        <input
                            name="apex_domain"
                            placeholder="example.edu"
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                        />

                        <button
                            type="submit"
                            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Add
                        </button>
                    </div>
                </form>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">ID</th>
                            <th className="px-4 py-3 font-semibold">Domain</th>
                            <th className="px-4 py-3 font-semibold">Created</th>
                            <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {rows.map((domain) => (
                            <tr key={domain.id} className="border-t border-slate-200">
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                    {domain.id}
                                </td>

                                <td className="px-4 py-3 text-slate-900">
                                    {domain.apex_domain}
                                </td>

                                <td className="px-4 py-3 text-slate-700">
                                    {domain.created_datetime_utc
                                        ? new Date(domain.created_datetime_utc).toLocaleString()
                                        : "Unknown"}
                                </td>

                                <td className="px-4 py-3">
                                    <form action={deleteDomain}>
                                        <input type="hidden" name="id" value={domain.id} />
                                        <button
                                            type="submit"
                                            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {rows.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No domains found.
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}