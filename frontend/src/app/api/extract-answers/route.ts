import { visionRequest } from "@/lib/openrouter";
import { NextResponse } from "next/server";

export const maxDuration = 60; // Allow max 60s for Vercel edge/serverless

export async function POST(req: Request) {
  try {
    const { imageBase64, pageNumber } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    const prompt = `
      You are an expert handwriting analysis AI.
      Analyze this image of a page from a student's handwritten answer sheet.
      
      Extract every distinct block of ACTUAL ANSWER TEXT written by the student.
      CRITICAL RULES:
      - ONLY extract blocks that contain an actual written answer.
      - DO NOT extract headers, titles, or page numbers (e.g., "COMPUTER SCIENCE - ASSIGNMENT 5").
      - DO NOT extract empty labels (e.g., if you see "Ans 1:" but there is no text written after or below it, DO NOT include it).
      
      For each valid answer block, provide:
      1. The transcribed text of the answer.
      2. Any explicit question reference they wrote (like "Q1", "1)", "Ans 3"). If there is no explicit number, return null.
      3. A highly accurate normalized 2D bounding box (x, y, width, height) that fully encapsulates the handwritten answer block. Values must be between 0.0 and 1.0, where x=0,y=0 is the top-left.

      Return ONLY valid JSON (no markdown, no code fences, no explanation) in this exact format:
      {
        "answers": [
          {
            "id": "a_p1_1",
            "text": "The transcribed handwritten text",
            "questionReference": "Q1",
            "boundingBox": {
              "x": 0.05,
              "y": 0.1,
              "width": 0.9,
              "height": 0.25
            }
          }
        ]
      }

      Rules:
      - "id" should be unique, formatted as a_p{pageNumber}_{index} (e.g., a_p1_1, a_p1_2)
      - "questionReference" should be null (not the string "null") if the student didn't explicitly write a question number
      - Bounding box values must be between 0.0 and 1.0
      - The current page number is: ${pageNumber}
    `;

    // Strip data URI prefix if present
    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

    const responseText = await visionRequest(prompt, [
      { base64: base64Data, mimeType: "image/jpeg" },
    ]);

    // Parse JSON from the response, handling possible markdown code fences
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    }
    const data = JSON.parse(jsonStr);

    // Attach the page number to each answer object for convenience
    const answersWithPage = data.answers.map((ans: any) => ({
      ...ans,
      page: pageNumber,
    }));

    return NextResponse.json({ answers: answersWithPage });
  } catch (error: any) {
    console.error("Error extracting answers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
