export type ChartType =
  | 'timeline'
  | 'heatmap'
  | 'bar'
  | 'radar'
  | 'donut'
  | 'stackedBar'
  | 'wordcloud'

export type CategoryId = 'overview' | 'time' | 'distribution' | 'contributors' | 'types'

export interface Category {
  id: CategoryId
  name: string
  description: string
  icon: string
}

export interface DashboardChart {
  id: string
  title: string
  description: string
  type: ChartType
  category: CategoryId
  dimensions: {
    width: number
    height: number
  }
  minWidth?: number
  minHeight?: number
}

export interface ChartData {
  chartId: string
  data: any // 각 차트 타입별로 구체적인 타입 정의 필요
}

export interface ChartFilter {
  field: string
  operator: 'eq' | 'gt' | 'lt' | 'contains'
  value: any
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
