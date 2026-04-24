import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ImageUploadForm from "./image-upload-form"

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

async function createImage(formData: FormData) {
    "use server"

    const url = String(formData.get("url") ?? "").trim()

    if (!url) {
        redirect("/admin/images")
    }

    const supabase = await createClient()

    await supabase.from("images").insert({
        url,
        is_common_use: false,
    })

    redirect("/admin/images")
}

async function toggleCommonUse(formData: FormData) {
    "use server"

    const id = String(formData.get("id"))
    const currentValue = String(formData.get("currentValue")) === "true"

    const supabase = await createClient()

    await supabase
        .from("images")
        .update({
            is_common_use: !currentValue,
            modified_datetime_utc: new Date().toISOString(),
        })
        .eq("id", id)

    redirect("/admin/images")
}

async function deleteImage(formData: FormData) {
    "use server"

    const id = String(formData.get("id"))
    const supabase = await createClient()

    await supabase.from("images").delete().eq("id", id)

    redirect("/admin/images")
}

export default async function AdminImagesPage() {
    const supabase = await requireSuperAdmin()

    const { data: images, error } = await supabase
        .from("images")
        .select("id, url, created_datetime_utc, modified_datetime_utc, is_common_use")
        .order("created_datetime_utc", { ascending: false })
        .limit(30)

    if (error) {
        console.error("Error loading images:", error)
    }

    const rows = images ?? []

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">Images</h1>
                        <p className="mt-2 text-slate-600">
                            Create, read, update, and delete uploaded images.
                        </p>
                    </div>

                    <Link
                        href="/admin"
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                <ImageUploadForm />

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">ID</th>
                            <th className="px-4 py-3 font-semibold">URL</th>
                            <th className="px-4 py-3 font-semibold">Common Use</th>
                            <th className="px-4 py-3 font-semibold">Created</th>
                            <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {rows.map((image) => (
                            <tr key={image.id} className="border-t border-slate-200 align-top">
                                <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-slate-500">
                                    {image.id}
                                </td>

                                <td className="max-w-md truncate px-4 py-3 text-slate-700">
                                    <a
                                        href={image.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-700 hover:underline"
                                    >
                                        {image.url}
                                    </a>
                                </td>

                                <td className="px-4 py-3">
                                    {image.is_common_use ? (
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
                                    {image.created_datetime_utc
                                        ? new Date(image.created_datetime_utc).toLocaleString()
                                        : "Unknown"}
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <form action={toggleCommonUse}>
                                            <input type="hidden" name="id" value={image.id} />
                                            <input
                                                type="hidden"
                                                name="currentValue"
                                                value={String(image.is_common_use)}
                                            />
                                            <button
                                                type="submit"
                                                className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                                            >
                                                Toggle
                                            </button>
                                        </form>

                                        <form action={deleteImage}>
                                            <input type="hidden" name="id" value={image.id} />
                                            <button
                                                type="submit"
                                                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {rows.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No images found.
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}