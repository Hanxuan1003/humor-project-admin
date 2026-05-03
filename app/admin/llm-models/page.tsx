import Link from "next/link"
import { redirect } from "next/navigation"
import { requireSuperAdmin } from "@/lib/admin/require-superadmin"

async function createModel(formData: FormData) {
    "use server"

    const name = String(formData.get("name") ?? "").trim()
    const provider_id = Number(formData.get("provider_id"))
    const provider_model_id = String(formData.get("provider_model_id") ?? "").trim()

    if (!name || !provider_id || !provider_model_id) {
        redirect("/admin/llm-models")
    }

    const supabase = await requireSuperAdmin()

    const { error } = await supabase.from("llm_models").insert({
        name,
        llm_provider_id: provider_id,
        provider_model_id,
    })

    if (error) {
        console.error("Error creating model:", error)
    }

    redirect("/admin/llm-models")
}

async function updateModel(formData: FormData) {
    "use server"

    const id = Number(formData.get("id"))
    const name = String(formData.get("name") ?? "").trim()
    const provider_id = Number(formData.get("provider_id"))
    const provider_model_id = String(formData.get("provider_model_id") ?? "").trim()

    if (!id || !name || !provider_id || !provider_model_id) {
        redirect("/admin/llm-models")
    }

    const supabase = await requireSuperAdmin()

    const { error } = await supabase
        .from("llm_models")
        .update({
            name,
            llm_provider_id: provider_id,
            provider_model_id,
        })
        .eq("id", id)

    if (error) {
        console.error("Error updating model:", error)
    }

    redirect("/admin/llm-models")
}

async function deleteModel(formData: FormData) {
    "use server"

    const id = Number(formData.get("id"))
    const supabase = await requireSuperAdmin()

    const { error } = await supabase.from("llm_models").delete().eq("id", id)

    if (error) {
        console.error("Error deleting model:", error)
    }

    redirect("/admin/llm-models")
}

export default async function LlmModelsPage() {
    const supabase = await requireSuperAdmin()

    const { data: providers } = await supabase
        .from("llm_providers")
        .select("id, name")
        .order("name")

    const { data: models } = await supabase
        .from("llm_models")
        .select("id, name, provider_model_id, llm_provider_id")
        .order("id")

    const rows = models ?? []
    const providerRows = providers ?? []

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">LLM Models</h1>
                        <p className="mt-2 text-slate-600">
                            Create, read, update, and delete model records.
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
                    action={createModel}
                    className="mb-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-4"
                >
                    <h2 className="text-xl font-bold text-slate-900 md:col-span-4">Add Model</h2>
                    <input
                        name="name"
                        placeholder="Model name (e.g. GPT-4o)"
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    />

                    <input
                        name="provider_model_id"
                        placeholder="Provider Model ID (e.g. gpt-4o)"
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    />

                    <select
                        name="provider_id"
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    >
                        <option value="">Select provider</option>
                        {providerRows.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Add Model
                    </button>
                </form>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">ID</th>
                            <th className="px-4 py-3 font-semibold">Editable Model Details</th>
                            <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {rows.map((m) => (
                            <tr key={m.id} className="border-t border-slate-200 align-top">
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                    {m.id}
                                </td>
                                <td className="px-4 py-3">
                                    <form action={updateModel} className="grid gap-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
                                        <input type="hidden" name="id" value={m.id} />
                                        <input
                                            name="name"
                                            defaultValue={m.name}
                                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <select
                                            name="provider_id"
                                            defaultValue={m.llm_provider_id}
                                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        >
                                            {providerRows.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            name="provider_model_id"
                                            defaultValue={m.provider_model_id}
                                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <button
                                            type="submit"
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                                        >
                                            Update
                                        </button>
                                    </form>
                                </td>
                                <td className="px-4 py-3">
                                    <form action={deleteModel}>
                                        <input type="hidden" name="id" value={m.id} />
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
                            No LLM models found.
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
