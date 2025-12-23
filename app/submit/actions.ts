"use server"

import { pool } from "@/app/lib/db"

export async function submitToolAction(formData: FormData) {
    const name = formData.get("name") as string
    const websiteUrl = formData.get("websiteUrl") as string
    const contactEmail = formData.get("contactEmail") as string
    const description = formData.get("description") as string
    const logoUrl = formData.get("logoUrl") as string
    const screenshotUrl = formData.get("screenshotUrl") as string
    const videoUrl = formData.get("videoUrl") as string

    if (!name || !websiteUrl || !contactEmail || !description) {
        return { error: "Required fields missing" }
    }

    try {
        await pool.query(`
            INSERT INTO tool_submissions (
                name, website_url, contact_email, description, logo_url, screenshot_url, video_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [name, websiteUrl, contactEmail, description, logoUrl || null, screenshotUrl || null, videoUrl || null])

        return { success: true }
    } catch (err) {
        console.error("Submission action failed:", err)
        return { error: "Failed to dispatch submission. Please try again later." }
    }
}
