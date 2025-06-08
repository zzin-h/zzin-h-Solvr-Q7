export interface RawRelease {
  Repository: string
  'Release ID': number
  'Tag Name': string
  'Release Name': string | null
  'Published At': string
  'Created At': string
  'Author Username': string
  'Is Draft': boolean
  'Is Prerelease': boolean
  Description: string | null
  'Release URL': string
  'Is Weekday': boolean
  Year: string
  Month: string
  Week: string
  'Day of Week': number
}

// API Response Types
export interface TimelineData {
  month: string
  count: number
}

export interface CalendarData {
  day: string
  value: number
}

export interface WeekdayData {
  name: string
  count: number
}

export interface TimeDistributionData {
  hour: string
  count: number
}

export interface ContributorData {
  name: string
  value: number
}

export interface ReleaseTypeData {
  repository: string
  regular: number
  prerelease: number
  draft: number
}

export interface WordCloudData {
  text: string
  value: number
}

export interface DashboardData {
  timeline: TimelineData[]
  calendar: CalendarData[]
  weekday: WeekdayData[]
  timeDistribution: TimeDistributionData[]
  contributors: ContributorData[]
  releaseTypes: ReleaseTypeData[]
  wordCloud: WordCloudData[]
}
