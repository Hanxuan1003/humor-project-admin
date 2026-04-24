"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function ImageUploadForm() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleUpload() {
        if (!file) return

        try {
            setUploading(true)
            setError(null)

            const presignResponse = await fetch("/api/images/presign", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contentType: file.type,
                }),
            })

            const presignData = await presignResponse.json()

            if (!presignResponse.ok) {
                throw new Error(presignData?.error || "Failed to get presigned URL")
            }

            const { presignedUrl, cdnUrl } = presignData

            if (!presignedUrl || !cdnUrl) {
                throw new Error("Missing presignedUrl or cdnUrl")
            }

            const uploadResponse = await fetch(presignedUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type,
                },
                body: file,
            })

            if (!uploadResponse.ok) {
                throw new Error("Failed to upload image")
            }

            const supabase = createClient()

            const { error: insertError } = await supabase.from("images").insert({
                url: cdnUrl,
                is_common_use: false,
            })

            if (insertError) {
                throw new Error(insertError.message)
            }

            window.location.reload()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Upload New Image</h2>
            <p className="mt-1 text-sm text-slate-600">
                Upload an image through the REST pipeline, then save its CDN URL.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                />

                <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                    {uploading ? "Uploading..." : "Upload Image"}
                </button>
            </div>

            {file && (
                <p className="mt-3 text-sm text-slate-600">
                    Selected: {file.name}
                </p>
            )}

            {error && (
                <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}
        </div>
    )
}