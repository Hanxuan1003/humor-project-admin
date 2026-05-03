import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json()
        const imageUrl = String(url ?? "").trim()

        if (!imageUrl) {
            return NextResponse.json(
                { error: "A valid image URL is required" },
                { status: 400 }
            )
        }

        const supabase = await createClient()
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("is_superadmin")
            .eq("id", user.id)
            .single()

        if (!profile?.is_superadmin) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            )
        }

        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session?.access_token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const response = await fetch("https://api.almostcrackd.ai/pipeline/upload-image-from-url", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                imageUrl,
                isCommonUse: false,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { error: data?.error ?? "Failed to register image" },
                { status: response.status }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error("Create image route error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
