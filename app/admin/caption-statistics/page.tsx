import Link from "next/link"
import { requireSuperAdmin } from "@/lib/admin/require-superadmin"

type DatabaseRow = Record<string, unknown>

type CaptionStatistic = {
    id: string
    captionText: string
    voteCount: number
    averageRating: number | null
    lowestRating: number | null
    highestRating: number | null
    latestVoteAt: string | null
}

const CAPTION_TEXT_FIELDS = ["caption", "caption_text", "text", "content", "generated_caption"]
const RATING_FIELDS = ["rating", "score", "value", "vote", "humor_rating", "funniness_rating"]
const CAPTION_ID_FIELDS = ["caption_id", "captionId"]
const DATE_FIELDS = ["created_datetime_utc", "created_at", "inserted_at", "modified_datetime_utc"]

function getStringValue(row: DatabaseRow, fields: string[]) {
    for (const field of fields) {
        const value = row[field]

        if (typeof value === "string" && value.trim().length > 0) {
            return value
        }

        if (typeof value === "number" && Number.isFinite(value)) {
            return String(value)
        }
    }

    return null
}

function getNumberValue(row: DatabaseRow, fields: string[]) {
    for (const field of fields) {
        const value = row[field]

        if (typeof value === "number" && Number.isFinite(value)) {
            return value
        }

        if (typeof value === "string") {
            const parsedValue = Number(value)

            if (Number.isFinite(parsedValue)) {
                return parsedValue
            }
        }
    }

    return null
}

function getDateValue(row: DatabaseRow) {
    return getStringValue(row, DATE_FIELDS)
}

function formatNumber(value: number | null, digits = 1) {
    return value === null ? "Not available" : value.toFixed(digits)
}

function formatDate(value: string | null) {
    return value ? new Date(value).toLocaleString() : "Unknown"
}

function buildCaptionStatistics(captions: DatabaseRow[], votes: DatabaseRow[]) {
    const captionsById = new Map<string, DatabaseRow>()

    for (const caption of captions) {
        if (caption.id !== undefined && caption.id !== null) {
            captionsById.set(String(caption.id), caption)
        }
    }

    const groupedVotes = new Map<string, DatabaseRow[]>()

    for (const vote of votes) {
        const captionId = getStringValue(vote, CAPTION_ID_FIELDS)

        if (!captionId) {
            continue
        }

        groupedVotes.set(captionId, [...(groupedVotes.get(captionId) ?? []), vote])
    }

    return Array.from(groupedVotes.entries())
        .map(([captionId, captionVotes]) => {
            const caption = captionsById.get(captionId)
            const ratings = captionVotes
                .map((vote) => getNumberValue(vote, RATING_FIELDS))
                .filter((rating): rating is number => rating !== null)
            const latestVoteAt = captionVotes
                .map(getDateValue)
                .filter((date): date is string => date !== null)
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null

            return {
                id: captionId,
                captionText: caption
                    ? getStringValue(caption, CAPTION_TEXT_FIELDS) ?? `Caption ${captionId}`
                    : `Caption ${captionId}`,
                voteCount: captionVotes.length,
                averageRating: ratings.length > 0
                    ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length
                    : null,
                lowestRating: ratings.length > 0 ? Math.min(...ratings) : null,
                highestRating: ratings.length > 0 ? Math.max(...ratings) : null,
                latestVoteAt,
            }
        })
        .sort((first, second) => {
            if (second.voteCount !== first.voteCount) {
                return second.voteCount - first.voteCount
            }

            return (second.averageRating ?? -Infinity) - (first.averageRating ?? -Infinity)
        })
}

export default async function CaptionStatisticsPage() {
    const supabase = await requireSuperAdmin()

    const { data: captions, error: captionsError } = await supabase
        .from("captions")
        .select("*")
        .limit(500)

    const { data: votes, error: votesError } = await supabase
        .from("caption_votes")
        .select("*")
        .limit(2000)

    if (captionsError) {
        console.error("Error loading captions for statistics:", captionsError)
    }

    if (votesError) {
        console.error("Error loading caption votes for statistics:", votesError)
    }

    const statistics = buildCaptionStatistics(captions ?? [], votes ?? [])
    const totalRatings = statistics.reduce((total, statistic) => total + statistic.voteCount, 0)
    const ratingsWithScores = statistics.filter((statistic) => statistic.averageRating !== null)
    const overallAverage = ratingsWithScores.length > 0
        ? ratingsWithScores.reduce((total, statistic) => {
            return total + (statistic.averageRating ?? 0) * statistic.voteCount
        }, 0) / ratingsWithScores.reduce((total, statistic) => total + statistic.voteCount, 0)
        : null
    const mostRatedCaption = statistics[0]
    const highestRatedCaption = [...statistics]
        .filter((statistic) => statistic.averageRating !== null)
        .sort((first, second) => (second.averageRating ?? 0) - (first.averageRating ?? 0))[0]

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">Caption Statistics</h1>
                        <p className="mt-2 text-slate-600">
                            Statistics about captions users are rating.
                        </p>
                    </div>

                    <Link
                        href="/admin"
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Rated Captions" value={statistics.length} />
                    <StatCard title="Total Ratings" value={totalRatings} />
                    <StatCard title="Average Rating" value={formatNumber(overallAverage)} />
                    <StatCard title="Ratings per Caption" value={formatNumber(
                        statistics.length > 0 ? totalRatings / statistics.length : null,
                    )} />
                </div>

                <div className="mb-8 grid gap-6 lg:grid-cols-2">
                    <HighlightCard title="Most Rated Caption" statistic={mostRatedCaption} />
                    <HighlightCard title="Highest Rated Caption" statistic={highestRatedCaption} />
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Caption</th>
                            <th className="px-4 py-3 font-semibold">Ratings</th>
                            <th className="px-4 py-3 font-semibold">Average</th>
                            <th className="px-4 py-3 font-semibold">Lowest</th>
                            <th className="px-4 py-3 font-semibold">Highest</th>
                            <th className="px-4 py-3 font-semibold">Latest Rating</th>
                            <th className="px-4 py-3 font-semibold">Caption ID</th>
                        </tr>
                        </thead>

                        <tbody>
                        {statistics.map((statistic) => (
                            <tr key={statistic.id} className="border-t border-slate-200 align-top">
                                <td className="max-w-md px-4 py-3 text-slate-900">
                                    {statistic.captionText}
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-900">
                                    {statistic.voteCount}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {formatNumber(statistic.averageRating)}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {formatNumber(statistic.lowestRating)}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {formatNumber(statistic.highestRating)}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {formatDate(statistic.latestVoteAt)}
                                </td>
                                <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-slate-500">
                                    {statistic.id}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {statistics.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No rated captions found.
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

function StatCard({ title, value }: { title: string; value: number | string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>
    )
}

function HighlightCard({
                           title,
                           statistic,
                       }: {
    title: string
    statistic?: CaptionStatistic
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            {statistic ? (
                <>
                    <p className="mt-3 text-lg font-bold text-slate-900">
                        {statistic.captionText}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                        {statistic.voteCount} ratings, {formatNumber(statistic.averageRating)} average
                    </p>
                </>
            ) : (
                <p className="mt-3 text-sm text-slate-600">No ratings yet.</p>
            )}
        </div>
    )
}
