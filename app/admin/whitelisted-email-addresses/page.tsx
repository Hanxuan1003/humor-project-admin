import Link from "next/link"
import { redirect } from "next/navigation"
import { requireSuperAdmin } from "@/lib/admin/require-superadmin"

async function createEmail(formData: FormData) {
    "use server"

    const email_address = String(formData.get("email_address") ?? "").trim()

    if (!email_address) {
        redirect("/admin/whitelisted-email-addresses")
    }

    const supabase = await requireSuperAdmin()

    const { error } = await supabase
        .from("whitelist_email_addresses")
        .insert({ email_address })

    if (error) {
        console.error("Error creating email:", error)
    }

    redirect("/admin/whitelisted-email-addresses")
}

async function deleteEmail(formData: FormData) {
    "use server"

    const id = Number(formData.get("id"))
    const supabase = await requireSuperAdmin()

    const { error } = await supabase
        .from("whitelist_email_addresses")
        .delete()
        .eq("id", id)

    if (error) {
        console.error("Error deleting email:", error)
    }

    redirect("/admin/whitelisted-email-addresses")
}

export default async function Page() {
    const supabase = await requireSuperAdmin()

    const { data, error } = await supabase
        .from("whitelist_email_addresses")
        .select("id, email_address, created_datetime_utc")
        .order("created_datetime_utc", { ascending: false })

    if (error) {
        console.error("Error loading emails:", error)
    }

    const rows = data ?? []

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">
                            Whitelisted Emails
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Create, read, and delete whitelisted email addresses.
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
                    action={createEmail}
                    className="mb-8 flex gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <input
                        name="email_address"
                        placeholder="test@columbia.edu"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    />

                    <button
                        type="submit"
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Add
                    </button>
                </form>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">ID</th>
                            <th className="px-4 py-3 font-semibold">Email Address</th>
                            <th className="px-4 py-3 font-semibold">Created</th>
                            <th className="px-4 py-3 font-semibold">Action</th>
                        </tr>
                        </thead>

                        <tbody>
                        {rows.map((r) => (
                            <tr key={r.id} className="border-t border-slate-200">
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                    {r.id}
                                </td>
                                <td className="px-4 py-3 text-slate-900">
                                    {r.email_address}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {r.created_datetime_utc
                                        ? new Date(r.created_datetime_utc).toLocaleString()
                                        : "Unknown"}
                                </td>
                                <td className="px-4 py-3">
                                    <form action={deleteEmail}>
                                        <input type="hidden" name="id" value={r.id} />
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
                            No whitelisted emails found.
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}