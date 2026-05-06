import { codeToHtml } from "shiki";

const chatSnippet = `import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"

const nvidia = createOpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: process.env.NVIDIA_BASE_URL ?? "https://integrate.api.nvidia.com/v1",
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: nvidia.chat(process.env.NVIDIA_MODEL_DEFAULT ?? "google/gemma-4-31b-it"),
    messages,
  })

  return result.toUIMessageStreamResponse()
}`;

export async function getChatCodeLines() {
  const html = await codeToHtml(chatSnippet, {
    lang: "ts",
    theme: "github-dark",
  });

  const lines = [...html.matchAll(/<span class="line">(.*?)<\/span>/g)].map(
    (match) => match[1],
  );
  return lines.length ? lines : chatSnippet.split("\n");
}
