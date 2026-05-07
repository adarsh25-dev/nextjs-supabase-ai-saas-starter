type ActivityPoint = {
  day: string
  fullDate: string
  value: number
}

export function buildActivityData(
  totalMessages: number,
  recentSessions: Array<{ created_at: string; updated_at?: string }>
) {
  const sessionsByDay = new Map<string, number>()
  recentSessions.forEach((session) => {
    const activityAt = session.updated_at ?? session.created_at
    const key = new Date(activityAt).toISOString().slice(0, 10)
    sessionsByDay.set(key, (sessionsByDay.get(key) ?? 0) + 1)
  })

  const points: ActivityPoint[] = []
  for (let index = 89; index >= 0; index--) {
    const date = new Date()
    date.setDate(date.getDate() - index)
    const key = date.toISOString().slice(0, 10)
    const sessionWeight = sessionsByDay.get(key) ?? 0
    const baseline = Math.max(0, Math.round(totalMessages / 60))
    const wave = Math.round(Math.sin((89 - index) / 5) * (baseline * 0.25 + 1))
    points.push({
      day: `${date.getMonth() + 1}/${date.getDate()}`,
      fullDate: key,
      value: Math.max(0, baseline + wave + sessionWeight * 4),
    })
  }
  return points
}

export function buildSparkline(source: ActivityPoint[]) {
  const slim = source.slice(-8)
  return slim.map((item, index) => ({ x: `${index + 1}`, y: item.value }))
}

export function usageBarColor(percent: number) {
  if (percent >= 90) return "hsl(4 41% 53%)"
  if (percent >= 70) return "hsl(32 47% 61%)"
  return "hsl(16 60% 60%)"
}

export function usageBarGradient(percent: number) {
  if (percent >= 90) {
    return "linear-gradient(90deg, hsl(10 52% 64%) 0%, hsl(4 41% 53%) 100%)"
  }
  if (percent >= 70) {
    return "linear-gradient(90deg, hsl(38 55% 68%) 0%, hsl(32 47% 61%) 100%)"
  }
  return "linear-gradient(90deg, hsl(23 68% 66%) 0%, hsl(16 60% 60%) 100%)"
}
