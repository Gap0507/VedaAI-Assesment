import { NextResponse } from "next/server";

export const maxDuration = 60;

interface Question {
  id: string;
  number: string;
  text: string;
  marks: number;
  order: number;
}

interface Answer {
  id: string;
  text: string;
  questionReference: string | null;
  page: number;
  boundingBox: { x: number; y: number; width: number; height: number };
}

interface Mapping {
  questionId: string;
  answerId: string;
  confidence: number;
  reason: string;
  status: "mapped" | "review" | "unmatched";
}

/**
 * Normalize a question reference string for fuzzy matching.
 * Strips common prefixes like "Q", "Ans", "Answer", punctuation, and whitespace.
 * Examples: "Q11(a)" → "11a", "Ans 3" → "3", "1)" → "1"
 */
function normalizeRef(ref: string): string {
  return ref
    .toLowerCase()
    .replace(/^(ans(wer)?|q(uestion)?)\s*/i, "")  // Strip prefixes
    .replace(/[^a-z0-9]/g, "");                     // Keep only alphanumeric
}

/**
 * Local TypeScript-based mapping engine.
 * Maps answers to questions WITHOUT any AI call.
 *
 * Strategy:
 * 1. Exact match on questionReference → question.number
 * 2. Fuzzy normalized match
 * 3. Sequential fallback for unmatched answers
 */
function mapAnswersToQuestions(questions: Question[], answers: Answer[]): Mapping[] {
  const mappings: Mapping[] = [];
  const mappedQuestionIds = new Set<string>();
  const mappedAnswerIds = new Set<string>();

  // Build a lookup from normalized question number → question
  const normalizedQMap = new Map<string, Question>();
  for (const q of questions) {
    normalizedQMap.set(normalizeRef(q.number), q);
  }

  // --- Pass 1: Exact / fuzzy reference match ---
  for (const answer of answers) {
    if (!answer.questionReference) continue;

    const normalizedRef = normalizeRef(answer.questionReference);
    const matchedQuestion = normalizedQMap.get(normalizedRef);

    if (matchedQuestion && !mappedQuestionIds.has(matchedQuestion.id)) {
      mappings.push({
        questionId: matchedQuestion.id,
        answerId: answer.id,
        confidence: 0.95,
        reason: `Matched by explicit reference "${answer.questionReference}" → Q${matchedQuestion.number}`,
        status: "mapped",
      });
      mappedQuestionIds.add(matchedQuestion.id);
      mappedAnswerIds.add(answer.id);
    }
  }

  // --- Pass 2: Sequential fallback ---
  // Sort remaining answers by page, then by vertical position (y coordinate)
  const unmappedAnswers = answers
    .filter((a) => !mappedAnswerIds.has(a.id))
    .sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      return a.boundingBox.y - b.boundingBox.y;
    });

  // Sort remaining questions by order
  const unmappedQuestions = questions
    .filter((q) => !mappedQuestionIds.has(q.id))
    .sort((a, b) => a.order - b.order);

  // Map sequentially
  for (let i = 0; i < unmappedAnswers.length; i++) {
    const answer = unmappedAnswers[i];
    if (i < unmappedQuestions.length) {
      const question = unmappedQuestions[i];
      mappings.push({
        questionId: question.id,
        answerId: answer.id,
        confidence: 0.6,
        reason: `Mapped by sequential order (answer ${i + 1} → question ${question.number})`,
        status: "review",
      });
      mappedQuestionIds.add(question.id);
      mappedAnswerIds.add(answer.id);
    } else {
      // More answers than questions — mark as unmatched
      mappings.push({
        questionId: questions[0]?.id || "unknown",
        answerId: answer.id,
        confidence: 0.2,
        reason: "No matching question found — excess answer block",
        status: "unmatched",
      });
    }
  }

  return mappings;
}

export async function POST(req: Request) {
  try {
    const { questions, answers } = await req.json();

    if (!questions || !answers) {
      return NextResponse.json(
        { error: "Questions and answers arrays are required" },
        { status: 400 }
      );
    }

    // Pure local logic — no AI call needed
    const mappings = mapAnswersToQuestions(questions, answers);

    return NextResponse.json({ mappings });
  } catch (error: any) {
    console.error("Error mapping answers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
