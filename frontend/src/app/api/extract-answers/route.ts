import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
      2. Any explicit question reference they wrote (like "Q1", "1)", "Ans 3"). 
         - CRITICAL: DO NOT guess or infer the question number. If the student just wrote "Ans:" or "Sol:" or nothing at all, you MUST return null. ONLY return a string if there is a literal number written next to the answer block.
      3. A highly accurate normalized 2D bounding box (x, y, width, height) that FULLY ENCAPSULATES the ENTIRE handwritten answer block. 
         - CRITICAL: If the answer spans MULTIPLE LINES, the bounding box MUST wrap around ALL lines, from the very top of the first line to the very bottom of the last line. Do not just box the first line.
         - Values must be between 0.0 and 1.0, where x=0,y=0 is the top-left.

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
      - "id" should be unique, formatted as a_p${pageNumber}_{index}
      - "questionReference" should be null if not explicitly written
      - Bounding box values must be between 0.0 and 1.0
    `;

    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
    
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
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
                  id: { type: SchemaType.STRING },
                  text: { type: SchemaType.STRING },
                  questionReference: { type: SchemaType.STRING, nullable: true },
                  boundingBox: {
                    type: SchemaType.OBJECT,
                    properties: {
                      x: { type: SchemaType.NUMBER },
                      y: { type: SchemaType.NUMBER },
                      width: { type: SchemaType.NUMBER },
                      height: { type: SchemaType.NUMBER }
                    },
                    required: ["x", "y", "width", "height"]
                  }
                },
                required: ["id", "text", "boundingBox"]
              }
            }
          },
          required: ["answers"]
        }
      }
    });

    let result;
    const MAX_RETRIES = 3;
    let attempt = 0;
    
    while (attempt < MAX_RETRIES) {
      try {
        result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
        ]);
        break; // Success
      } catch (error: any) {
        if ((error.status === 429 || error.status === 503) && attempt < MAX_RETRIES - 1) {
          attempt++;
          const waitTime = 1000 * Math.pow(2, attempt); // 2s, 4s, etc.
          console.log(`[Rate Limit / 503] Retrying extract-answers for page ${pageNumber} in ${waitTime}ms... (Attempt ${attempt})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw error; // Not a rate limit error, or we ran out of retries
        }
      }
    }
    
    const data = JSON.parse(result!.response.text());

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
