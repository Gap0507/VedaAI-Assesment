import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60; // Allow max 60s for Vercel edge/serverless

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { pdfBase64 } = await req.json();

    if (!pdfBase64) {
      return NextResponse.json({ error: "No PDF data provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
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
                  id: { type: SchemaType.STRING, description: "A unique identifier, e.g., q1, q11a" },
                  number: { type: SchemaType.STRING, description: "The exact question number from the paper, e.g., '1', '11(a)'" },
                  text: { type: SchemaType.STRING, description: "The complete text of the question" },
                  marks: { type: SchemaType.NUMBER, description: "The total marks for this question, if specified" },
                  order: { type: SchemaType.NUMBER, description: "The sequential order index (1, 2, 3...)" },
                },
                required: ["id", "number", "text", "marks", "order"],
              },
            },
          },
          required: ["questions"],
        },
      },
    });

    const prompt = `
      You are an expert educational document parser. 
      Extract all questions from the provided exam paper PDF.
      Ensure you capture the exact question number/label accurately (e.g., '1', '11(a)', '11(b)'). 
      Treat sub-questions (like a, b, c) as distinct question objects.
      If marks are not explicitly stated for a question, set marks to 0.
    `;

    // The pdfBase64 needs to have the data URI prefix stripped if it was sent with one
    const base64Data = pdfBase64.includes(",") ? pdfBase64.split(",")[1] : pdfBase64;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      }
    ]);

    const responseText = result.response.text();
    const data = JSON.parse(responseText);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error extracting questions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
