import Link from "next/link"
import { redirect } from "next/navigation"
import { requireSuperAdmin } from "@/lib/admin/require-superadmin"

async function createCaptionExample(formData: FormData) {
    "use server"

    const image_description = String(formData.get("image_description") ?? "").trim()
    const caption = String(formData.get("caption") ?? "").trim()
    const explanation = String(formData.get("explanation") ?? "").trim()
    const priority = Number(formData.get("priority") ?? 0)
    const image_id = String(formData.get("image_id") ?? "").trim()

    if (!image_description || !caption || !explanation) {
        redirect("/admin/caption-examples")
    }

    const supabase = await requireSuperAdmin()

    const insertData = {
        image_description,
        caption,
        explanation,
        priority,
        image_id: image_id || null,
    }

    const { error } = await supabase
        .from("caption_examples")
        .insert(insertData)

    if (error) {
        console.error("Error creating caption example:", error)
    }

    redirect("/admin/caption-examples")
}

async function updateCaptionExample(formData: FormData) {
    "use server"

    const id = Number(formData.get("id"))
    const image_description = String(formData.get("image_description") ?? "").trim()
    const caption = String(formData.get("caption") ?? "").trim()
    const explanation = String(formData.get("explanation") ?? "").trim()
    const priority = Number(formData.get("priority") ?? 0)
    const image_id = String(formData.get("image_id") ?? "").trim()

    if (!id || !image_description || !caption || !explanation) {
        redirect("/admin/caption-examples")
    }

    const supabase = await requireSuperAdmin()

    const { error } = await supabase
        .from("caption_examples")
        .update({
            image_description,
            caption,
            explanation,
            priority,
            image_id: image_id || null,
            modified_datetime_utc: new Date().toISOString(),
        })
        .eq("id", id)

    if (error) {
        console.error("Error updating caption example:", error)
    }

    redirect("/admin/caption-examples")
}

async function deleteCaptionExample(formData: FormData) {
    "use server"

    const id = Number(formData.get("id"))
    const supabase = await requireSuperAdmin()

    const { error } = await supabase
        .from("caption_examples")
        .delete()
        .eq("id", id)

    if (error) {
        console.error("Error deleting caption example:", error)
    }

    redirect("/admin/caption-examples")
}

export default async function CaptionExamplesPage() {
    const supabase = await requireSuperAdmin()

    const { data: examples, error } = await supabase
        .from("caption_examples")
        .select("id, image_description, caption, explanation, priority, image_id, created_datetime_utc")
        .order("created_datetime_utc", { ascending: false })
        .limit(50)

    if (error) {
        console.error("Error loading caption examples:", error)
    }

    const { data: images, error: imagesError } = await supabase
        .from("images")
        .select("id, url")
        .order("created_datetime_utc", { ascending: false })
        .limit(50)

    if (imagesError) {
        console.error("Error loading images:", imagesError)
    }

    const rows = examples ?? []
    const imageRows = images ?? []

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">
                            Caption Examples
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Create, read, update, and delete caption examples.
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
                    action={createCaptionExample}
                    className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <h2 className="text-xl font-bold text-slate-900">
                        Add Caption Example
                    </h2>

                    <textarea
                        name="image_description"
                        placeholder="Image description..."
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    />

                    <textarea
                        name="caption"
                        placeholder="Caption..."
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    />

                    <textarea
                        name="explanation"
                        placeholder="Explanation..."
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    />

                    <input
                        name="priority"
                        type="number"
                        defaultValue={0}
                        placeholder="Priority"
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    />

                    <select
                        name="image_id"
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    >
                        <option value="">No image</option>
                        {imageRows.map((image) => (
                            <option key={image.id} value={image.id}>
                                {image.url ?? image.id}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Add Caption Example
                    </button>
                </form>

                <div className="space-y-4">
                    {rows.map((example) => (
                        <div
                            key={example.id}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <form action={updateCaptionExample} className="flex flex-col gap-3">
                                <input type="hidden" name="id" value={example.id} />

                                <div className="text-sm font-semibold text-slate-500">
                                    ID: {example.id}
                                </div>

                                <textarea
                                    name="image_description"
                                    defaultValue={example.image_description}
                                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                                />

                                <textarea
                                    name="caption"
                                    defaultValue={example.caption}
                                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                                />

                                <textarea
                                    name="explanation"
                                    defaultValue={example.explanation}
                                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                                />

                                <input
                                    name="priority"
                                    type="number"
                                    defaultValue={example.priority}
                                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                                />

                                <select
                                    name="image_id"
                                    defaultValue={example.image_id ?? ""}
                                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                                >
                                    <option value="">No image</option>
                                    {imageRows.map((image) => (
                                        <option key={image.id} value={image.id}>
                                            {image.url ?? image.id}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>

                            <form action={deleteCaptionExample} className="mt-3">
                                <input type="hidden" name="id" value={example.id} />
                                <button
                                    type="submit"
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </form>
                        </div>
                    ))}

                    {rows.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                            No caption examples found.
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}