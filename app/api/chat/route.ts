import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { xai } from '@ai-sdk/xai';
import { deepseek } from '@ai-sdk/deepseek';
import { anthropic } from '@ai-sdk/anthropic';
import { NextRequest } from 'next/server';

const providers = [
  { name: 'gemini',   model: google('gemini-2.5-pro') },
  { name: 'grok',     model: xai('grok-4') },
  { name: 'deepseek', model: deepseek('deepseek-chat') },
  { name: 'claude',   model: anthropic('claude-sonnet-4-6') },   // বা opus
];

export async function POST(req: NextRequest) {
  const { messages, preferredProvider = 'gemini' } = await req.json();

  // Preferred provider প্রথমে চেষ্টা করবে
  const sortedProviders = [
    providers.find(p => p.name === preferredProvider),
    ...providers.filter(p => p.name !== preferredProvider)
  ].filter(Boolean);

  let lastError: any = null;

  for (const provider of sortedProviders) {
    try {
      console.log(`Trying ${provider.name}...`);

      const result = streamText({
        model: provider.model,
        messages,
        temperature: 0.7,
        maxTokens: 3000,
      });

      return result.toDataStreamResponse();

    } catch (error: any) {
      lastError = error;
      console.log(`${provider.name} failed, trying next...`);

      // Rate limit (429) হলে পরেরটায় যাবে
      if (error?.status === 429 || error?.status === 500) {
        continue;
      }
      // অন্য গুরুতর error হলে break করতে পারো
    }
  }

  // সব প্রোভাইডার ফেল করলে
  console.error('All providers failed:', lastError);
  return new Response(
    JSON.stringify({ error: 'All AI providers are currently unavailable. Please try again later.' }), 
    { status: 503 }
  );
}
