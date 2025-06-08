import { DashboardChart } from '../types/dashboard'

export const charts: DashboardChart[] = [
  // Time Analysis
  {
    id: 'release-trend',
    title: 'Release Trend',
    description: 'Number of releases over time',
    type: 'timeline',
    category: 'time',
    dimensions: { width: 600, height: 300 }
  },
  {
    id: 'release-calendar',
    title: 'Release Calendar',
    description: 'Release distribution in calendar view',
    type: 'heatmap',
    category: 'time',
    dimensions: { width: 600, height: 300 }
  },

  // Distribution
  {
    id: 'weekday-distribution',
    title: 'Weekday Distribution',
    description: 'Release distribution by day of week',
    type: 'bar',
    category: 'distribution',
    dimensions: { width: 400, height: 300 }
  },
  {
    id: 'time-radar',
    title: 'Time Distribution',
    description: 'Release distribution by time of day',
    type: 'radar',
    category: 'distribution',
    dimensions: { width: 400, height: 300 }
  },

  // Contributors
  {
    id: 'top-contributors',
    title: 'Top Contributors',
    description: 'Most active release contributors',
    type: 'donut',
    category: 'contributors',
    dimensions: { width: 400, height: 300 }
  },
  {
    id: 'contributor-timeline',
    title: 'Contributor Activity',
    description: 'Contributor activity over time',
    type: 'timeline',
    category: 'contributors',
    dimensions: { width: 600, height: 300 }
  },

  // Release Types
  {
    id: 'release-types',
    title: 'Release Types',
    description: 'Distribution of different release types',
    type: 'stackedBar',
    category: 'types',
    dimensions: { width: 400, height: 300 }
  },
  {
    id: 'release-notes',
    title: 'Release Notes Analysis',
    description: 'Common terms in release notes',
    type: 'wordcloud',
    category: 'types',
    dimensions: { width: 400, height: 300 }
  }
]
