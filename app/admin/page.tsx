import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

async function getTableCount(supabase: Awaited<ReturnType<typeof createClient>>, table: string) {
    const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true })

    if (error) {
        console.error(`Error fetching count for ${table}:`, error)
        return 0
    }

    return count ?? 0
}

export default async function AdminPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("id", user.id)
        .single()

    if (profileError || !profile?.is_superadmin) {
        redirect("/access-denied")
    }

    const [usersCount, imagesCount, captionsCount, votesCount] = await Promise.all([
        getTableCount(supabase, "profiles"),
        getTableCount(supabase, "images"),
        getTableCount(supabase, "captions"),
        getTableCount(supabase, "caption_votes"),
    ])

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-6xl">
                <h1 className="mb-2 text-4xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="mb-8 text-slate-600">Week 6 starter dashboard for Humor Project</p>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Users" value={usersCount} />
                    <StatCard title="Total Images" value={imagesCount} />
                    <StatCard title="Total Captions" value={captionsCount} />
                    <StatCard title="Total Votes" value={votesCount} />
                </div>
            </div>
        </main>
    )
}

function StatCard({ title, value }: { title: string; value: number }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>
    )
}