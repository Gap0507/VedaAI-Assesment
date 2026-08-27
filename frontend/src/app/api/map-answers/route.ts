import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { questions, answers } = await req.json();

    if (!questions || !answers) {
      return NextResponse.json({ error: "Questions and answers arrays are required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            mappings: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  questionId: { type: SchemaType.STRING },
                  answerId: { type: SchemaType.STRING },
                  confidence: { type: SchemaType.NUMBER, description: "Confidence score between 0.0 and 1.0" },
                  reason: { type: SchemaType.STRING, description: "Brief reason for this mapping" },
                  status: { type: SchemaType.STRING, description: "Either 'mapped' (confidence >= 0.8), 'review' (0.5 to 0.79), or 'unmatched' (<0.5)" }
                },
                required: ["questionId", "answerId", "confidence", "reason", "status"]
              }
            }
          },
          required: ["mappings"]
        }
      }
    });

    const prompt = `
      You are an expert mapping engine. 
      I will provide you with a JSON list of extracted Questions from an exam, and a JSON list of handwritten Answers extracted from a student's paper.
      
      Your task is to map each Answer to the correct Question.
      
      Consider:
      1. Explicit References: If the answer has a 'questionReference' (e.g., "Q7"), strongly associate it with that question.
      2. Semantic Similarity: If there is no explicit reference, map the answer text to the question text based on semantic meaning.
      3. Context: Students often answer sequentially, though not always.
      
      Return a mapping object for every Answer provided. 
      If an answer clearly does not match any question, map it to the closest match but give a low confidence score (< 0.5) and status "unmatched".
      
      QUESTIONS:
      ${JSON.stringify(questions, null, 2)}
      
      ANSWERS:
      ${JSON.stringify(answers, null, 2)}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const data = JSON.parse(responseText);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error mapping answers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
