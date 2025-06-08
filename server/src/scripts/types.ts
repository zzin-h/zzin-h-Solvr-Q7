import { z } from 'zod'

export const ReleaseSchema = z.object({
  id: z.number(),
  tag_name: z.string(),
  name: z.string().nullable(),
  published_at: z.string(),
  author: z.object({
    login: z.string()
  }),
  repository: z.string(),
  html_url: z.string(),
  body: z.string().nullable(),
  draft: z.boolean(),
  prerelease: z.boolean(),
  created_at: z.string()
})

export type Release = z.infer<typeof ReleaseSchema>

export interface ReleaseStats {
  repository: string
  totalReleases: number
  yearlyStats: Record<string, number>
  monthlyStats: Record<string, number>
  weeklyStats: Record<string, number>
  authorStats: Record<string, number>
}

export interface StatRecord {
  repository: string
  metric: 'Total' | 'Yearly' | 'Monthly' | 'Weekly' | 'Author'
  period: string
  count: number
}

export interface RawReleaseRecord {
  repository: string
  releaseId: number
  tagName: string
  releaseName: string | null
  publishedAt: string
  createdAt: string
  authorUsername: string
  isDraft: boolean
  isPrerelease: boolean
  description: string | null
  releaseUrl: string
  isWeekday: boolean
  year: string
  month: string
  week: string
  dayOfWeek: number
}
