import Link from "next/link"
import { redirect } from "next/navigation"
import { requireSuperAdmin } from "@/lib/admin/require-superadmin"

type HumorFlavorMixRow = {
    id: number
    created_datetime_utc: string | null
    modified_datetime_utc: string | null
    humor_flavor_id: number
    caption_count: number
    humor_flavors: {
        slug: string | null
        description: string | null
    } | {
        slug: string | null
        description: string | null
    }[] | null
}

async function updateMix(formData: FormData) {
    "use server"

    const id = Number(formData.get("id"))
    const caption_count = Number(formData.get("caption_count"))

    if (!id || Number.isNaN(caption_count)) {
        redirect("/admin/humor-flavor-mix")
    }

    const supabase = await requireSuperAdmin()

    const { error } = await supabase
        .from("humor_flavor_mix")
        .update({
            caption_count,
            modified_datetime_utc: new Date().toISOString(),
        })
        .eq("id", id)

    if (error) {
        console.error("Error updating humor flavor mix:", error)
    }

    redirect("/admin/humor-flavor-mix")
}

export default async function HumorFlavorMixPage() {
    const supabase = await requireSuperAdmin()

    const { data, error } = await supabase
        .from("humor_flavor_mix")
        .select(`
            id,
            created_datetime_utc,
            modified_datetime_utc,
            humor_flavor_id,
            caption_count,
            humor_flavors (
                slug,
                description
            )
        `)
        .order("id")

    if (error) {
        console.error("Error loading humor flavor mix:", error)
    }

    const rows = data ?? []

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">
                            Humor Flavor Mix
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Read and update the caption count for each humor flavor mix record.
                        </p>
                    </div>

                    <Link
                        href="/admin"
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                <div className="space-y-4">
                    {rows.map((row: HumorFlavorMixRow) => (
                        <MixForm key={row.id} row={row} />
                    ))}

                    {rows.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                            No humor flavor mix records found.
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

function MixForm({ row }: { row: HumorFlavorMixRow }) {
    const flavor = Array.isArray(row.humor_flavors)
        ? row.humor_flavors[0]
        : row.humor_flavors

    return (
        <form
            action={updateMix}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <input type="hidden" name="id" value={row.id} />

            <div className="grid gap-4 md:grid-cols-5">
                <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">ID</p>
                    <p className="mt-1 text-sm text-slate-900">{row.id}</p>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                        Humor Flavor ID
                    </p>
                    <p className="mt-1 text-sm text-slate-900">{row.humor_flavor_id}</p>
                </div>

                <div className="md:col-span-2">
                    <p className="text-xs font-semibold uppercase text-slate-500">Flavor</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                        {flavor?.slug ?? "Unknown"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {flavor?.description ?? ""}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                        Caption Count
                    </p>
                    <input
                        name="caption_count"
                        type="number"
                        defaultValue={row.caption_count}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm"
                    />
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                    Modified:{" "}
                    {row.modified_datetime_utc
                        ? new Date(row.modified_datetime_utc).toLocaleString()
                        : "Unknown"}
                </p>

                <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                    Update
                </button>
            </div>
        </form>
    )
}
