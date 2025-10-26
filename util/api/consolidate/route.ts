import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { pieces } = await req.json();

    if (!pieces || pieces.length === 0) {
      return NextResponse.json(
        { error: "No pieces provided" },
        { status: 400 }
      );
    }

    // Extract text from all pieces
    const pieceTexts = pieces
      .map((p: any) => p.text)
      .filter((text: string) => text && text.trim().length > 0);

    if (pieceTexts.length === 0) {
      return NextResponse.json(
        { error: "No text content found in pieces" },
        { status: 400 }
      );
    }

    // Create prompt for consolidation
    const prompt = `You are consolidating ideas from a collaborative workspace. Here are ${
      pieceTexts.length
    } ideas from team members:

${pieceTexts.map((text: any, i: any) => `• ${text}`).join("\n")}

Create a consolidated summary with:
- Key themes and patterns
- Main takeaways (3-5 bullet points)
- Connections between ideas
- Actionable insights

Keep it concise and well-organized. Use bullet points and short paragraphs.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that consolidates team ideas into clear, actionable summaries.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const consolidatedText = completion.choices[0].message.content;

    return NextResponse.json({
      consolidatedText,
      originalPieceCount: pieces.length,
    });
  } catch (error: any) {
    console.error("Error consolidating ideas:", error);
    return NextResponse.json(
      { error: error.message || "Failed to consolidate ideas" },
      { status: 500 }
    );
  }
}
