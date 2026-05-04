import Link from "next/link"
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

    if (!user) redirect("/login")

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
            <div className="mx-auto max-w-7xl">
                <h1 className="mb-2 text-4xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="mb-8 text-slate-600">Week 7 domain model admin dashboard</p>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Users" value={usersCount} />
                    <StatCard title="Total Images" value={imagesCount} />
                    <StatCard title="Total Captions" value={captionsCount} />
                    <StatCard title="Total Votes" value={votesCount} />
                </div>

                <h2 className="mt-10 mb-4 text-2xl font-bold text-slate-900">Core Admin</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <AdminLink href="/admin/users" title="Users / Profiles" description="Read user profile records" />
                    <AdminLink href="/admin/images" title="Images" description="Create, read, update, and delete images" />
                    <AdminLink href="/admin/captions" title="Captions" description="Read generated captions" />
                    <AdminLink href="/admin/caption-statistics" title="Caption Statistics" description="Read rating statistics for captions" />
                    <AdminLink href="/admin/caption-requests" title="Caption Requests" description="Read caption generation requests" />
                    <AdminLink href="/admin/caption-examples" title="Caption Examples" description="Create, read, update, and delete caption examples" />
                    <AdminLink href="/admin/terms" title="Terms" description="Create, read, update, and delete humor terms" />
                </div>

                <h2 className="mt-10 mb-4 text-2xl font-bold text-slate-900">Humor Model</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <AdminLink href="/admin/humor-flavors" title="Humor Flavors" description="Read humor flavor records" />
                    <AdminLink href="/admin/humor-flavor-steps" title="Humor Flavor Steps" description="Read humor flavor step records" />
                    <AdminLink href="/admin/humor-flavor-mix" title="Humor Flavor Mix" description="Read and update humor flavor mix" />
                </div>

                <h2 className="mt-10 mb-4 text-2xl font-bold text-slate-900">LLM System</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <AdminLink href="/admin/llm-providers" title="LLM Providers" description="Create, read, update, and delete LLM providers" />
                    <AdminLink href="/admin/llm-models" title="LLM Models" description="Create, read, update, and delete LLM models" />
                    <AdminLink href="/admin/llm-prompt-chains" title="LLM Prompt Chains" description="Read LLM prompt chain records" />
                    <AdminLink href="/admin/llm-responses" title="LLM Responses" description="Read LLM response logs" />
                </div>

                <h2 className="mt-10 mb-4 text-2xl font-bold text-slate-900">Access Control</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <AdminLink href="/admin/allowed-signup-domains" title="Allowed Signup Domains" description="Create, read, update, and delete allowed signup domains" />
                    <AdminLink href="/admin/whitelisted-email-addresses" title="Whitelisted Email Addresses" description="Create, read, update, and delete whitelisted emails" />
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

function AdminLink({
                       href,
                       title,
                       description,
                   }: {
    href: string
    title: string
    description: string
}) {
    return (
        <Link
            href={href}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
        </Link>
    )
}
