import Link from "next/link"
import { requireSuperAdmin } from "@/lib/admin/require-superadmin"
import { redirect } from "next/navigation"

async function createProvider(formData: FormData) {
    "use server"

    const name = String(formData.get("name") ?? "").trim()
    if (!name) redirect("/admin/llm-providers")

    const supabase = await requireSuperAdmin()

    await supabase.from("llm_providers").insert({
        name,
    })

    redirect("/admin/llm-providers")
}

async function updateProvider(formData: FormData) {
    "use server"

    const id = Number(formData.get("id"))
    const name = String(formData.get("name") ?? "").trim()

    if (!id || !name) redirect("/admin/llm-providers")

    const supabase = await requireSuperAdmin()

    const { error } = await supabase
        .from("llm_providers")
        .update({ name })
        .eq("id", id)

    if (error) {
        console.error("Error updating provider:", error)
    }

    redirect("/admin/llm-providers")
}

async function deleteProvider(formData: FormData) {
    "use server"

    const id = Number(formData.get("id"))
    const supabase = await requireSuperAdmin()

    await supabase.from("llm_providers").delete().eq("id", id)

    redirect("/admin/llm-providers")
}

export default async function Page() {
    const supabase = await requireSuperAdmin()

    const { data } = await supabase
        .from("llm_providers")
        .select("*")
        .order("id")

    const rows = data ?? []

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">LLM Providers</h1>
                        <p className="mt-2 text-slate-600">
                            Create, read, update, and delete model provider records.
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
                    action={createProvider}
                    className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <h2 className="text-xl font-bold text-slate-900">Add Provider</h2>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <input
                            name="name"
                            placeholder="Provider name, e.g. OpenAI"
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                        />
                        <button
                            type="submit"
                            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Add Provider
                        </button>
                    </div>
                </form>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">ID</th>
                            <th className="px-4 py-3 font-semibold">Name</th>
                            <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {rows.map((row) => (
                            <tr key={row.id} className="border-t border-slate-200 align-top">
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                    {row.id}
                                </td>
                                <td className="px-4 py-3">
                                    <form action={updateProvider} className="flex gap-2">
                                        <input type="hidden" name="id" value={row.id} />
                                        <input
                                            name="name"
                                            defaultValue={row.name}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                                        />
                                        <button
                                            type="submit"
                                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                                        >
                                            Update
                                        </button>
                                    </form>
                                </td>
                                <td className="px-4 py-3">
                                    <form action={deleteProvider}>
                                        <input type="hidden" name="id" value={row.id} />
                                        <button
                                            type="submit"
                                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
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
                            No LLM providers found.
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
