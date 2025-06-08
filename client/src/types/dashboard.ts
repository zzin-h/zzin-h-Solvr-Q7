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
