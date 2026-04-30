import OpenAI from "openai"

const apiKey = process.env.OPENAI_API_KEY ?? "sk-placeholder"

export const openai = new OpenAI({ apiKey })
