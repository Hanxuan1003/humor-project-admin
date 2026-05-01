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

    // 👉 关键：取 providers
    const { data: providers } = await supabase
        .from("llm_providers")
        .select("id, name")

    // 👉 取 models
    const { data: models } = await supabase
        .from("llm_models")
        .select("id, name, provider_model_id, llm_provider_id")

    const rows = models ?? []

    return (
        <main className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-6">LLM Models</h1>

                {/* CREATE */}
                <form action={createModel} className="mb-8 bg-white p-6 rounded shadow flex flex-col gap-3">
                    <input
                        name="name"
                        placeholder="Model name (e.g. GPT-4o)"
                        className="border p-2 rounded"
                    />

                    <input
                        name="provider_model_id"
                        placeholder="Provider Model ID (e.g. gpt-4o)"
                        className="border p-2 rounded"
                    />

                    {/* 🔥 dropdown */}
                    <select name="provider_id" className="border p-2 rounded">
                        <option value="">Select provider</option>
                        {(providers ?? []).map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    <button className="bg-black text-white p-2 rounded">
                        Add Model
                    </button>
                </form>

                {/* TABLE */}
                <table className="w-full bg-white border">
                    <thead>
                    <tr className="bg-gray-100">
                        <th>ID</th>
                        <th>Name</th>
                        <th>Provider</th>
                        <th>Provider Model ID</th>
                        <th>Action</th>
                    </tr>
                    </thead>

                    <tbody>
                    {rows.map((m) => (
                        <tr key={m.id} className="border-t">
                            <td>{m.id}</td>
                            <td>{m.name}</td>
                            <td>{m.llm_provider_id}</td>
                            <td>{m.provider_model_id}</td>
                            <td>
                                <form action={deleteModel}>
                                    <input type="hidden" name="id" value={m.id} />
                                    <button className="text-red-600">Delete</button>
                                </form>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <Link href="/admin" className="block mt-6 text-blue-600">
                    ← Back
                </Link>
            </div>
        </main>
    )
}