import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey:
    "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", // keep it safe here
});

export async function POST(req: Request) {
  const { message, lang = "en" } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an AI Health Assistant that provides calm, factual guidance.
Always respond in the language specified: ${lang}.
If ${lang} is "te", respond in clear, natural Telugu.
If ${lang} is "hi", respond in simple Hindi.
If ${lang} is "en", respond in English.
Keep your tone friendly and helpful.`,
      },
      { role: "user", content: message },
    ],
  });

  return NextResponse.json({
    reply:
      completion.choices[0].message?.content ?? "Sorry, I didn’t get that.",
  });
}
