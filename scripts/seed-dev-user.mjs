import { createClient } from "@supabase/supabase-js"
import fs from "node:fs"
import path from "node:path"

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, "utf8")
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue

    const index = line.indexOf("=")
    if (index <= 0) continue

    const key = line.slice(0, index).trim()
    const value = line.slice(index + 1).trim()

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

const root = process.cwd()
loadEnvFile(path.join(root, ".env.local"))
loadEnvFile(path.join(root, ".env"))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const email = process.env.DEV_TEST_EMAIL ?? "test@company.com"
const password = process.env.DEV_TEST_PASSWORD ?? "Test@123456"
const fullName = process.env.DEV_TEST_NAME ?? "Dev Test User"

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function getUserByEmail(targetEmail) {
  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw error

    const users = data?.users ?? []
    const match = users.find((user) => user.email?.toLowerCase() === targetEmail.toLowerCase())
    if (match) return match
    if (users.length < perPage) return null

    page += 1
  }
}

async function ensureDevUser() {
  const existing = await getUserByEmail(email)
  if (existing) return existing

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  })

  if (error) throw error
  if (!data.user) throw new Error("User was not returned from createUser")
  return data.user
}

async function main() {
  const user = await ensureDevUser()
  let schemaReady = true

  const { error: profileError } = await admin.from("profiles").upsert({
    id: user.id,
    email,
    full_name: fullName,
  })
  if (profileError) {
    if (profileError.code === "PGRST205") {
      schemaReady = false
      console.warn("Skipping profile seed: public.profiles table is missing.")
    } else {
      throw profileError
    }
  }

  if (schemaReady) {
    const { error: subscriptionError } = await admin.from("subscriptions").insert({
      user_id: user.id,
      status: "active",
      plan_tier: "business",
    })
    if (subscriptionError) throw subscriptionError
  }

  console.log("Dev test user is ready:")
  console.log(`- email: ${email}`)
  console.log(`- password: ${password}`)
  if (schemaReady) {
    console.log("- plan_tier: business (10,000 monthly messages)")
  } else {
    console.log("- auth user created, but app tables are missing.")
    console.log("- run supabase/migrations/00001_initial_schema.sql in Supabase SQL Editor, then re-run this script.")
  }
}

main().catch((error) => {
  console.error("Failed to seed dev test user:", error)
  process.exit(1)
})
