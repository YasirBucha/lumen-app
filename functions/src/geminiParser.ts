import type { GmailMessageLite, ParseResult } from './parsers/types';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function geminiParse(msg: GmailMessageLite, apiKey: string): Promise<ParseResult | null> {
  const prompt = `You extract structured subscription billing data from email receipts.
Reply with JSON only. Schema:
{
  "is_subscription": boolean,
  "merchant": string,
  "amount": number,
  "currency": "PKR" | "USD" | "EUR" | "GBP" | null,
  "cadence": "monthly" | "yearly" | "weekly" | "one-time" | null,
  "category": "streaming" | "software" | "cloud" | "education" | "shopping" | "other",
  "confidence": 0.0-1.0,
  "notes": string
}
If this is not a subscription receipt, return {"is_subscription": false}.

Subject: ${msg.subject}
From: ${msg.from}
Body: ${msg.bodyText.slice(0, 4000)}`;

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as {
      is_subscription?: boolean;
      merchant?: string;
      amount?: number;
      currency?: ParseResult['currency'];
      cadence?: ParseResult['cadence'];
      category?: ParseResult['category'];
      confidence?: number;
      notes?: string;
    };
    if (!parsed.is_subscription) return null;
    return {
      isSubscription: true,
      merchant: parsed.merchant ?? 'Unknown',
      amount: parsed.amount ?? 0,
      currency: parsed.currency ?? null,
      cadence: parsed.cadence ?? null,
      category: parsed.category ?? 'other',
      confidence: parsed.confidence ?? 0.5,
      notes: parsed.notes,
    };
  } catch {
    return null;
  }
}
