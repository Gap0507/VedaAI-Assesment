import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60; // Allow max 60s for Vercel edge/serverless

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { imageBase64, pageNumber } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            answers: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  id: { type: SchemaType.STRING, description: "Unique ID for this answer, e.g., a_p1_1" },
                  text: { type: SchemaType.STRING, description: "The transcribed handwritten text of the answer block" },
                  questionReference: { type: SchemaType.STRING, description: "Any explicit question number the student wrote next to the answer (e.g., 'Q7', '7.'). Null if none.", nullable: true },
                  boundingBox: {
                    type: SchemaType.OBJECT,
                    description: "The normalized bounding box (0.0 to 1.0) of this entire answer block on the page",
                    properties: {
                      x: { type: SchemaType.NUMBER, description: "Top-left x coordinate (0-1)" },
                      y: { type: SchemaType.NUMBER, description: "Top-left y coordinate (0-1)" },
                      width: { type: SchemaType.NUMBER, description: "Width (0-1)" },
                      height: { type: SchemaType.NUMBER, description: "Height (0-1)" }
                    },
                    required: ["x", "y", "width", "height"]
                  }
                },
                required: ["id", "text", "boundingBox"] // questionReference is nullable
              }
            }
          },
          required: ["answers"]
        }
      }
    });

    const prompt = `
      You are an expert handwriting analysis AI.
      Analyze this image of a page from a student's handwritten answer sheet.
      
      Extract every distinct block of answer text written by the student.
      For each answer block, provide:
      1. The transcribed text.
      2. Any explicit question reference they wrote (like "Q1", "1)", "Ans 3"). If there is no explicit number next to the block, return null for questionReference.
      3. A highly accurate normalized 2D bounding box (x, y, width, height) that fully encapsulates the handwritten block. Values must be between 0.0 and 1.0, where x=0,y=0 is the top-left of the image.
    `;

    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg" // Using JPEG as per our PDF renderer
        }
      }
    ]);

    const responseText = result.response.text();
    const data = JSON.parse(responseText);

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
