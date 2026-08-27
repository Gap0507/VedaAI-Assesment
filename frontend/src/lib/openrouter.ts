import OpenAI from "openai";

// Read from environment variable, fallback to the recommended free MiniMax M3 model
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "minimax/minimax-m3:free";

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

/**
 * Send a vision request (text prompt + base64 images) to Qwen-VL via OpenRouter.
 * Returns the raw text content from the model response.
 */
export async function visionRequest(
  prompt: string,
  images: { base64: string; mimeType: string }[]
): Promise<string> {
  const imageContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] =
    images.map((img) => ({
      type: "image_url" as const,
      image_url: {
        url: `data:${img.mimeType};base64,${img.base64}`,
      },
    }));

  const response = await openrouter.chat.completions.create({
    model: OPENROUTER_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...imageContent,
        ],
      },
    ],
    temperature: 0.1, // Low temperature for deterministic structured output
    max_tokens: 8192,
  });

  const text = response.choices?.[0]?.message?.content;
  if (!text) {
    console.error("OpenRouter Response:", JSON.stringify(response, null, 2));
    throw new Error("Empty response from OpenRouter");
  }
  return text;
}

/**
 * Send a text-only request to Qwen via OpenRouter.
 * Used for tasks that don't need vision (like mapping).
 */
export async function textRequest(prompt: string): Promise<string> {
  const response = await openrouter.chat.completions.create({
    model: OPENROUTER_MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.1,
    max_tokens: 8192,
  });

  const text = response.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Empty response from OpenRouter");
  }
  return text;
}
