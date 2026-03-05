import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyDim8aHBcRQRB37L5zFkyy7mfGR_FMSUiw", // ⚠️ Use env var in production
});

export async function POST(req: Request) {
  try {
    // 🔹 Parse FormData (for image)
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 🔹 Convert image → Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    console.log("📷 Received file:", file.name, file.type, file.size);

    // 🔹 Generate content using Gemini 2.5
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: file.type || "image/jpeg",
            data: base64Image,
          },
        },
        {
          text: `Please read this prescription image carefully and extract:
- Medicine names
- Dosages
- Frequency (how often to take)
- Duration (if available)
Return a clear and structured summary.`,
        },
      ],
    });
    console.log("RESULT: ", result);
    const reply =
  result.candidates?.[0]?.content?.parts?.[0]?.text ||
  "⚠️ No readable text found.";
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("❌ Prescription analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}
