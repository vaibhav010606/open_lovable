/* eslint-disable */
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { provider, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API key is required" }, { status: 400 });
    }

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say hi" }] }]
        })
      });
      if (res.ok) return NextResponse.json({ success: true });
      return NextResponse.json({ success: false, error: await res.text() }, { status: 400 });
    }

    if (provider === 'claude') {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-latest",
          max_tokens: 10,
          messages: [{ role: "user", content: "Say hi" }]
        })
      });
      if (res.ok) return NextResponse.json({ success: true });
      return NextResponse.json({ success: false, error: await res.text() }, { status: 400 });
    }

    if (provider === 'openai') {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 10,
          messages: [{ role: "user", content: "Say hi" }]
        })
      });
      if (res.ok) return NextResponse.json({ success: true });
      return NextResponse.json({ success: false, error: await res.text() }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: "Invalid provider" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
