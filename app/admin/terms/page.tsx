import Link from "next/link"
import { redirect } from "next/navigation"
import { requireSuperAdmin } from "@/lib/admin/require-superadmin"

async function createTerm(formData: FormData) {
    "use server"

    const term = String(formData.get("term") ?? "").trim()
    const definition = String(formData.get("definition") ?? "").trim()
    const example = String(formData.get("example") ?? "").trim()
    const term_type_id = Number(formData.get("term_type_id"))

    if (!term || !definition || !example || !term_type_id) {
        redirect("/admin/terms")
    }

    const supabase = await requireSuperAdmin()

    const { error } = await supabase.from("terms").insert({
        term,
        definition,
        example,
        priority: 50,
        term_type_id,
    })

    if (error) {
        console.error("Error creating term:", error)
    }

    redirect("/admin/terms")
}

async function deleteTerm(formData: FormData) {
    "use server"

    const id = Number(formData.get("id"))
    const supabase = await requireSuperAdmin()

    const { error } = await supabase.from("terms").delete().eq("id", id)

    if (error) {
        console.error("Error deleting term:", error)
    }

    redirect("/admin/terms")
}

export default async function TermsPage() {
    const supabase = await requireSuperAdmin()

    const { data: terms, error } = await supabase
        .from("terms")
        .select("id, term, definition, example, priority, term_type_id")
        .order("id")

    if (error) {
        console.error("Error loading terms:", error)
    }

    const { data: termTypes, error: termTypesError } = await supabase
        .from("term_types")
        .select("id, name")
        .order("id")

    if (termTypesError) {
        console.error("Error loading term types:", termTypesError)
    }

    const rows = terms ?? []
    const types = termTypes ?? []

    return (
        <main className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">Terms</h1>
                        <p className="mt-2 text-slate-600">
                            Create, read, and delete humor terms.
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
                    action={createTerm}
                    className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <h2 className="text-xl font-bold text-slate-900">Add Term</h2>

                    <input
                        name="term"
                        placeholder="Term, e.g. NPC"
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    />

                    <textarea
                        name="definition"
                        placeholder="Definition..."
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    />

                    <textarea
                        name="example"
                        placeholder="Example sentence..."
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    />

                    <select
                        name="term_type_id"
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    >
                        <option value="">Select term type</option>
                        {types.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Add Term
                    </button>
                </form>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">ID</th>
                            <th className="px-4 py-3 font-semibold">Term</th>
                            <th className="px-4 py-3 font-semibold">Definition</th>
                            <th className="px-4 py-3 font-semibold">Example</th>
                            <th className="px-4 py-3 font-semibold">Priority</th>
                            <th className="px-4 py-3 font-semibold">Term Type</th>
                            <th className="px-4 py-3 font-semibold">Action</th>
                        </tr>
                        </thead>

                        <tbody>
                        {rows.map((t) => (
                            <tr key={t.id} className="border-t border-slate-200 align-top">
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                    {t.id}
                                </td>
                                <td className="px-4 py-3 text-slate-900">
                                    {t.term}
                                </td>
                                <td className="max-w-xs px-4 py-3 text-slate-700">
                                    {t.definition}
                                </td>
                                <td className="max-w-xs px-4 py-3 text-slate-700">
                                    {t.example}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {t.priority}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {t.term_type_id}
                                </td>
                                <td className="px-4 py-3">
                                    <form action={deleteTerm}>
                                        <input type="hidden" name="id" value={t.id} />
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
                            No terms found.
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}