import { codeToHtml } from "shiki"

const chatSnippet = `import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
  })

  return result.toUIMessageStreamResponse()
}`

export async function getChatCodeLines() {
  const html = await codeToHtml(chatSnippet, {
    lang: "ts",
    theme: "github-dark",
  })

  const lines = [...html.matchAll(/<span class="line">(.*?)<\/span>/g)].map((match) => match[1])
  return lines.length ? lines : chatSnippet.split("\n")
}
