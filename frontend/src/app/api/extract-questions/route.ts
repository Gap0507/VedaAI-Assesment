import { visionRequest } from "@/lib/openrouter";
import { NextResponse } from "next/server";

export const maxDuration = 60; // Allow max 60s for Vercel edge/serverless

export async function POST(req: Request) {
  try {
    const { pageImages } = await req.json();

    if (!pageImages || !Array.isArray(pageImages) || pageImages.length === 0) {
      return NextResponse.json({ error: "No page images provided" }, { status: 400 });
    }

    const prompt = `
      You are an expert educational document parser. 
      Extract all questions from the provided exam paper page images.
      Ensure you capture the exact question number/label accurately (e.g., '1', '11(a)', '11(b)'). 
      Treat sub-questions (like a, b, c) as distinct question objects.
      If marks are not explicitly stated for a question, set marks to 0.

      Return ONLY valid JSON (no markdown, no code fences, no explanation) in this exact format:
      {
        "questions": [
          {
            "id": "q1",
            "number": "1",
            "text": "The complete text of the question",
            "marks": 2,
            "order": 1
          }
        ]
      }

      Rules:
      - "id" should be a unique identifier like q1, q2, q11a, q11b
      - "number" is the exact label from the paper (e.g., "1", "11(a)")
      - "text" is the full question text
      - "marks" is the total marks (0 if not stated)
      - "order" is the sequential index starting from 1
    `;

    // Prepare images - strip data URI prefix if present
    const images = pageImages.map((img: string) => ({
      base64: img.includes(",") ? img.split(",")[1] : img,
      mimeType: "image/jpeg",
    }));

    const responseText = await visionRequest(prompt, images);

    // Parse JSON from the response, handling possible markdown code fences
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    }
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error extracting questions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
