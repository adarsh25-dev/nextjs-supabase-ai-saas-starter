export type ChatSession = {
  id: string
  title: string
  created_at: string
  updated_at?: string
}

export type ChatAttachment = {
  filename?: string
  mediaType: string
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  created_at: string
  attachments?: ChatAttachment[]
}
