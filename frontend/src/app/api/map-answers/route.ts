import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { questions, answers } = await req.json();

    if (!questions || !answers) {
      return NextResponse.json({ error: "Missing questions or answers" }, { status: 400 });
    }

    const prompt = `
      You are an expert AI teacher and grading assistant.
      I will provide you with a list of EXTRACTED QUESTIONS from an exam, and a list of EXTRACTED ANSWERS written by a student.

      Your job is to:
      1. Semantically match which answer(s) belong to which question. (Note: A student's answer might span multiple answer blocks, so you can map an array of answer IDs to a single question).
      2. Grade the student's answer based on the question context.
      3. Award marks (between 0 and the maximum marks allowed for that question).
      4. Provide short, encouraging teacher feedback (e.g., "Excellent work! You correctly identified X" or "Almost there, but you forgot to mention Y.").

      Questions JSON:
      ${JSON.stringify(questions, null, 2)}

      Answers JSON (student's handwritten blocks):
      ${JSON.stringify(answers.map((a: any) => ({ id: a.id, text: a.text, explicitReference: a.questionReference })), null, 2)}

      For EVERY question in the Questions JSON, you must return a mapping object.
      If the student did not answer the question (no relevant answer block found), return empty answerIds, 0 marks, feedback "Not attempted.", errorType "Not attempted", and status "unmatched".

      Status rules:
      - "mapped": Fully correct or mostly correct.
      - "review": Partial marks, incorrect, or needs human review.
      - "unmatched": No answer found.
      
      Error Types (examples):
      - "No error" (if fully correct)
      - "Not attempted" (if missing)
      - "Incomplete" (if partially answered)
      - "Calculation Error" (if math is wrong)
      - "Conceptual Error" (if fundamentally wrong)
      
      Additionally, provide a brief 'strengths' string and 'improvements' string summarizing the student's overall performance.
    `;

    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            strengths: { type: SchemaType.STRING, description: "Overall strengths of the student" },
            improvements: { type: SchemaType.STRING, description: "Areas for improvement" },
            mappings: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  questionId: { type: SchemaType.STRING },
                  answerIds: { 
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                  },
                  earnedMarks: { type: SchemaType.NUMBER },
                  feedback: { type: SchemaType.STRING },
                  errorType: { type: SchemaType.STRING, description: "E.g., No error, Not attempted, Incomplete" },
                  status: { type: SchemaType.STRING, description: "Must be 'mapped', 'review', or 'unmatched'" }
                },
                required: ["questionId", "answerIds", "earnedMarks", "feedback", "errorType", "status"]
              }
            }
          },
          required: ["strengths", "improvements", "mappings"]
        }
      }
    });

    let result;
    const MAX_RETRIES = 3;
    let attempt = 0;
    
    while (attempt < MAX_RETRIES) {
      try {
        result = await model.generateContent(prompt);
        break; // Success
      } catch (error: any) {
        if ((error.status === 429 || error.status === 503) && attempt < MAX_RETRIES - 1) {
          attempt++;
          const waitTime = 1000 * Math.pow(2, attempt);
          console.log(`[Rate Limit / 503] Retrying map-answers in ${waitTime}ms... (Attempt ${attempt})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw error;
        }
      }
    }

    const data = JSON.parse(result!.response.text());

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error mapping and grading answers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
