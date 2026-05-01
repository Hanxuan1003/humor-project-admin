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
        <main className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">LLM Providers</h1>

                {/* Create */}
                <form action={createProvider} className="mb-6 flex gap-2">
                    <input
                        name="name"
                        placeholder="Provider name"
                        className="border px-3 py-2 rounded"
                    />
                    <button className="bg-black text-white px-4 py-2 rounded">
                        Add
                    </button>
                </form>

                {/* Table */}
                <table className="w-full bg-white border rounded">
                    <thead>
                    <tr className="bg-gray-100">
                        <th>ID</th>
                        <th>Name</th>
                        <th>Action</th>
                    </tr>
                    </thead>

                    <tbody>
                    {rows.map((row) => (
                        <tr key={row.id} className="border-t">
                            <td>{row.id}</td>
                            <td>{row.name}</td>
                            <td>
                                <form action={deleteProvider}>
                                    <input type="hidden" name="id" value={row.id} />
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