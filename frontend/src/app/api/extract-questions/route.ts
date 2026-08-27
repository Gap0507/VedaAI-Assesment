import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

    const images = pageImages.map((img: string) => {
      const base64 = img.includes(",") ? img.split(",")[1] : img;
      return { base64, mimeType: "image/jpeg" };
    });

    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
    
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            questions: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  id: { type: SchemaType.STRING },
                  number: { type: SchemaType.STRING },
                  text: { type: SchemaType.STRING },
                  marks: { type: SchemaType.NUMBER },
                  order: { type: SchemaType.NUMBER },
                },
                required: ["id", "number", "text", "marks", "order"],
              },
            },
          },
          required: ["questions"],
        },
      },
    });

    const geminiParts = [
      prompt,
      ...images.map(img => ({
        inlineData: { data: img.base64, mimeType: img.mimeType }
      }))
    ];
    
    let result;
    const MAX_RETRIES = 3;
    let attempt = 0;
    
    while (attempt < MAX_RETRIES) {
      try {
        result = await model.generateContent(geminiParts as any);
        break; // Success
      } catch (error: any) {
        if ((error.status === 429 || error.status === 503) && attempt < MAX_RETRIES - 1) {
          attempt++;
          const waitTime = 1000 * Math.pow(2, attempt); // 2s, 4s, etc.
          console.log(`[Rate Limit / 503] Retrying extract-questions in ${waitTime}ms... (Attempt ${attempt})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw error; // Not a rate limit error, or we ran out of retries
        }
      }
    }
    
    const data = JSON.parse(result!.response.text());

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error extracting questions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
